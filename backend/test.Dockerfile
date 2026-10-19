# Need a custom image here so that we can incorporate an npm build too
# Alpine is super light
FROM node:18-alpine
RUN apk add --no-cache alpine-sdk

# Work in the backend directory
WORKDIR /var/www/backend
COPY backend/package.json backend/yarn.lock ./

# Install Node packages
RUN yarn install

# Start the development server
CMD ["/bin/sh", "-c", "make setup && yarn test"]
