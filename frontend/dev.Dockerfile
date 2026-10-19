# Need a custom image here so that we can incorporate an npm build too
# Alpine is super light
FROM node:22-alpine

# Install Python 3 and build tools
RUN apk add --no-cache python3 make g++

# Work in the membership-portal-ui directory
WORKDIR /var/www/membership-portal-ui

# Add Python 3 to the PATH environment variable
ENV PATH="/usr/bin/python3:${PATH}"

# Install dependencies at build time for deterministic installs and faster startup
COPY membership-portal-ui/package*.json ./
RUN npm ci --legacy-peer-deps

CMD ["npm", "run", "dev"]
