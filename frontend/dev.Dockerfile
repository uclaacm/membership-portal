# Need a custom image here so that we can incorporate an npm build too
# Alpine is super light
FROM node:22-alpine

# Install Python 3 and build tools
RUN apk add --no-cache python3 make g++

# Work in the membership-portal-ui directory
WORKDIR /var/www/membership-portal-ui

# Add Python 3 to the PATH environment variable
ENV PATH="/usr/bin/python3:${PATH}"

# Install dependencies on container start (after volumes are mounted)
CMD ["sh", "-c", "npm install --legacy-peer-deps && npm run dev"]
