# Need a custom image here so that we can incorporate an npm build too
# Alpine is super light
FROM node:18-alpine
RUN apk add --no-cache alpine-sdk

# Work in the membership-portal directory
WORKDIR /var/www/membership-portal
COPY membership-portal/package.json membership-portal/yarn.lock ./

# Install Node packages
RUN yarn install

# Start the development server
CMD ["/bin/sh", "-c", "make setup && yarn test"]
