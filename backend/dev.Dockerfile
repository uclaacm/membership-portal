# Need a custom image here so that we can incorporate an npm build too
# Alpine is super light
FROM node:18-alpine

# Install Python 3 and build tools
RUN apk add --no-cache python3 make g++

# Work in the membership-portal directory
WORKDIR /var/www/membership-portal

# Install dependencies at build time for deterministic installs and faster startup
COPY membership-portal/package*.json ./
RUN npm ci

# Start the development server
CMD ["/bin/sh", "-c", "make setup && npm run dev"]
