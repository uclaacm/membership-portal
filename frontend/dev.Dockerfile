# Need a custom image here so that we can incorporate an npm build too
# Alpine is super light
FROM node:13.12.0-alpine

# Work in the membership-portal-ui directory
WORKDIR /var/www/membership-portal-ui
COPY membership-portal-ui/package.json ./

# Install Node packages
RUN yarn

# Start the development server
CMD ["/bin/sh", "-c", "(node -e 'require(\"node-sass\")' || npm rebuild node-sass) && yarn dev"]
