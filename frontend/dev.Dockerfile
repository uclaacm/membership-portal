# Need a custom image here so that we can incorporate an npm build too
# Alpine is super light
FROM node:18-alpine

# Work in the membership-portal-ui directory
WORKDIR /var/www/membership-portal-ui
COPY membership-portal-ui/package.json membership-portal-ui/yarn.lock ./

# Install Python 3, build tools, and node_modules
RUN apk add --no-cache python3 make g++ && \
    yarn install

# Add Python 3 to the PATH environment variable
ENV PATH="/usr/bin/python3:${PATH}"

# Start the development server
CMD ["yarn", "dev"]
