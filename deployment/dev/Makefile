default: dev

build:
	docker compose build
	touch build

dev: build
	docker compose up

reboot:
	docker compose down -v
	docker compose up --build

# Push the current branches and redeploy them on the staging box.
# Staging runs the prod compose stack, so this drives ~/membership-portal/deployment/prod
# on the remote even though the script lives here. Pass a branch or flags through ARGS:
#   make staging
#   make staging ARGS="main"
#   make staging ARGS="--dry-run"
staging:
	./deploy-staging.sh $(ARGS)

# Open a shell on the staging box.
staging-ssh:
	ssh -i ~/.ssh/id_rsa_acm_west -p 5903 uclaacm@router.uclaacm.com

# Follow the staging backend logs without opening an interactive shell.
staging-logs:
	ssh -i ~/.ssh/id_rsa_acm_west -p 5903 uclaacm@router.uclaacm.com \
		"cd membership-portal/deployment/prod && docker compose logs -f --tail 100 backend"

.PHONY: staging staging-ssh staging-logs