# Need a custom image here so that we can incorporate an npm build too
# Alpine is super light
FROM node:13.12.0-alpine
RUN apk add alpine-sdk

# Work in the membership-portal directory
WORKDIR /var/www/membership-portal
COPY membership-portal/package.json ./

# Install Node packages
RUN yarn

# Start the development server
CMD ["/bin/sh", "-c", "make setup && yarn dev"]
