# Image for `make test` (docker-compose "test" profile): runs unit and integration tests.
# Alpine is super light
FROM node:18-alpine

# Install Python 3 and build tools (needed to compile native modules such as bcrypt)
RUN apk add --no-cache python3 make g++

# Work in the membership-portal directory
WORKDIR /var/www/membership-portal

# Install dependencies at build time for deterministic installs (requires package-lock.json)
COPY membership-portal/package*.json ./
RUN npm ci

# `make setup` creates the session secret and runs migrations against the throwaway test Postgres;
# `npm test` then runs unit tests and, if they pass, integration tests.
CMD ["/bin/sh", "-c", "make setup && npm test"]
