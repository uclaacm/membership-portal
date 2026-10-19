#!/usr/bin/env bash
#
# Push the current work to the staging box and redeploy it.
#
# Staging runs the *prod* compose stack (deployment/prod) — not this dev one.
# This script only lives in dev/ because that is where you already are while working; every
# remote command it runs happens in ~/membership-portal/deployment/prod on the staging host.
#
# What it does, in order:
#   1. checks the local checkout is clean and pushes its branch to origin
#   2. on staging, fetches and checks out that branch
#   3. rebuilds and restarts the prod compose stack there
#
# Database migrations are not run here: the backend image's CMD already runs
# `npx sequelize-cli db:migrate` on container start, so step 3 applies them.

set -euo pipefail

# ---------------------------------------------------------------- configuration

STAGING_HOST="${STAGING_HOST:-router.uclaacm.com}"
STAGING_PORT="${STAGING_PORT:-5903}"
STAGING_USER="${STAGING_USER:-uclaacm}"
STAGING_KEY="${STAGING_KEY:-$HOME/.ssh/id_rsa_acm_west}"

# Where the checkout and its compose stack live on staging, relative to the remote home directory.
REMOTE_REPO_DIR="membership-portal"
REMOTE_DEPLOY_DIR="$REMOTE_REPO_DIR/deployment/prod"

# This script sits in <repo>/deployment/dev, so the checkout root is two levels up.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOCAL_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

PUSH=1
FORCE=0
BUILD=1
DRY_RUN=0
ASSUME_YES=0
REQUESTED_BRANCH=""

# -------------------------------------------------------------------- utilities

bold() { printf '\033[1m%s\033[0m\n' "$*"; }
info() { printf '  %s\n' "$*"; }
warn() { printf '\033[33mwarning:\033[0m %s\n' "$*" >&2; }
die() { printf '\033[31merror:\033[0m %s\n' "$*" >&2; exit 1; }

usage() {
  cat <<'EOF'
Usage: ./deploy-staging.sh [BRANCH] [options]

  BRANCH        Branch to deploy.
                Omit to deploy whatever branch is currently checked out.

Options:
  --no-push     Skip the local push; only update staging and rebuild.
  --force       On staging, hard-reset the checkout to origin/BRANCH instead of a
                fast-forward pull. Use when staging has diverged.
  --no-build    Restart containers without rebuilding images.
  --dry-run     Print the plan and exit without changing anything.
  -y, --yes     Skip the confirmation prompt.
  -h, --help    Show this message.

Examples:
  ./deploy-staging.sh                 # deploy the current branch
  ./deploy-staging.sh main            # put staging on main
  ./deploy-staging.sh feat/foo --force
EOF
}

# Runs a command on staging. Quoting is the caller's problem; everything this
# script sends is assembled below rather than interpolated from user input.
remote() {
  ssh -i "$STAGING_KEY" -p "$STAGING_PORT" -o ConnectTimeout=15 \
    "$STAGING_USER@$STAGING_HOST" "$@"
}

# ------------------------------------------------------------ argument handling

while [ $# -gt 0 ]; do
  case "$1" in
    --no-push) PUSH=0 ;;
    --force) FORCE=1 ;;
    --no-build) BUILD=0 ;;
    --dry-run) DRY_RUN=1 ;;
    -y|--yes) ASSUME_YES=1 ;;
    -h|--help) usage; exit 0 ;;
    -*) die "Unknown option: $1 (try --help)" ;;
    *)
      [ -n "$REQUESTED_BRANCH" ] && die "Only one branch may be given (got '$REQUESTED_BRANCH' and '$1')"
      REQUESTED_BRANCH="$1"
      ;;
  esac
  shift
done

# ------------------------------------------------------------ local preflight

bold "Preflight"

[ -f "$STAGING_KEY" ] || die "SSH key not found at $STAGING_KEY (override with STAGING_KEY=...)"

git -C "$LOCAL_ROOT" rev-parse --git-dir >/dev/null 2>&1 || die "$LOCAL_ROOT is not a git repository"

BRANCH="${REQUESTED_BRANCH:-$(git -C "$LOCAL_ROOT" rev-parse --abbrev-ref HEAD)}"
[ "$BRANCH" = "HEAD" ] && die "Checkout is in detached HEAD; pass an explicit branch"

# A dirty tree means the code on staging would not be the code you are looking at.
# Only enforced when pushing — with --no-push the local tree is irrelevant.
if [ "$PUSH" -eq 1 ] && [ -n "$(git -C "$LOCAL_ROOT" status --porcelain)" ]; then
  git -C "$LOCAL_ROOT" status --short | sed 's/^/      /'
  die "Checkout has uncommitted changes. Commit or stash them, or pass --no-push."
fi

info "branch → $BRANCH"

bold "Plan"
info "target      $STAGING_USER@$STAGING_HOST:$STAGING_PORT"
info "remote dir  ~/$REMOTE_DEPLOY_DIR  (the prod stack — staging runs from here)"
info "push        $([ "$PUSH" -eq 1 ] && echo yes || echo 'no (--no-push)')"
info "remote sync $([ "$FORCE" -eq 1 ] && echo 'reset --hard (--force)' || echo 'pull --ff-only')"
info "rebuild     $([ "$BUILD" -eq 1 ] && echo 'yes (--build)' || echo 'no (--no-build)')"

if [ "$DRY_RUN" -eq 1 ]; then
  bold "Dry run — nothing was changed."
  exit 0
fi

if [ "$ASSUME_YES" -eq 0 ]; then
  printf '\nDeploy to staging? [y/N] '
  read -r reply
  case "$reply" in
    [yY]|[yY][eE][sS]) ;;
    *) echo "Aborted."; exit 1 ;;
  esac
fi

# ------------------------------------------------------------------- push local

if [ "$PUSH" -eq 1 ]; then
  bold "Pushing"
  info "pushing $BRANCH"
  git -C "$LOCAL_ROOT" push --set-upstream origin "$BRANCH"
fi

# -------------------------------------------------------------- update staging

bold "Updating staging"

# The remote half runs as one script so a failure anywhere aborts the deploy
# instead of rebuilding against a half-updated checkout.
remote 'bash -s' -- \
  "$BRANCH" "$FORCE" "$BUILD" "$REMOTE_REPO_DIR" "$REMOTE_DEPLOY_DIR" <<'REMOTE_SCRIPT'
set -euo pipefail

BRANCH="$1"
FORCE="$2"
BUILD="$3"
REPO_DIR="$4"
DEPLOY_DIR="$5"

sync_repo() {
  repo="$1"
  branch="$2"
  path="$HOME/$repo"

  echo "  --- $repo → $branch"
  cd "$path"

  if [ -n "$(git status --porcelain)" ]; then
    if [ "$FORCE" = "1" ]; then
      echo "      local changes present; discarding (--force)"
    else
      echo "      ERROR: $repo has uncommitted changes on staging." >&2
      git status --short | sed 's/^/        /' >&2
      echo "      Re-run with --force to discard them." >&2
      exit 1
    fi
  fi

  git fetch --prune origin

  if [ "$FORCE" = "1" ]; then
    git checkout -B "$branch" "origin/$branch"
    git reset --hard "origin/$branch"
  elif git show-ref --verify --quiet "refs/heads/$branch"; then
    git checkout "$branch"
    git pull --ff-only origin "$branch"
  else
    git checkout -b "$branch" --track "origin/$branch"
  fi

  echo "      now at $(git rev-parse --short HEAD) $(git log -1 --pretty=%s)"
}

sync_repo "$REPO_DIR" "$BRANCH"

echo "  --- rebuilding stack in ~/$DEPLOY_DIR"
cd "$HOME/$DEPLOY_DIR"

[ -f node.env ] || { echo "      ERROR: node.env missing in ~/$DEPLOY_DIR. It is not in git; copy it there first." >&2; exit 1; }

# Compose interpolates GOOGLE_* (the nginx image's NEXT_PUBLIC_* build args) and
# MONGO_* (mongodb service) from the shell, so they must be exported, not just
# present in the env_file.
export $(grep -E '^(GOOGLE|MONGO)_' node.env | xargs)

if [ "$BUILD" = "1" ]; then
  docker compose up -d --build
else
  docker compose up -d
fi

echo "  --- containers"
docker compose ps
REMOTE_SCRIPT

bold "Done"
info "Backend logs:  make staging-logs"
info "Shell:         make staging-ssh"
