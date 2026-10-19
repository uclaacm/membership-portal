# membership-portal-ui

Frontend for the ACM Membership Portal. For full documentation, see the [wiki](https://wiki.uclaacm.com/doc/membership-portal-zXucs8mbPS).

## Overview

Built with Next.js 16, React 19, TypeScript, and Tailwind CSS. State is managed with Jotai. Authentication is handled via Google OAuth.

## Migration: Redux → Next.js

The codebase is mid-migration from a Redux/webpack frontend to Next.js App Router. There are two source trees:

- `src/` — legacy Redux source (components, containers, reducers). Do not add new features here.
- `app/` — new Next.js App Router source. All new work goes here.

When working on a feature, check if it already exists in `src/` and port it to `app/` rather than writing it from scratch.

## Development

Development is done through Docker via the deployment repo. Follow the setup instructions in [membership-portal-deployment](https://github.com/uclaacm/membership-portal-deployment).

Do not run `npm install` locally — dependencies are installed inside the Docker container at build time. Running `npm install` locally with a different Node version will cause `package-lock.json` drift.

The UI is available at `http://localhost:8000` and communicates with the backend API on port `8080`.

## Testing

```bash
npm test
```

Tests use Jest with jsdom.
