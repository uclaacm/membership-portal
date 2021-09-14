# Need a custom image here so that we can incorporate an npm build too
# Alpine is super light
FROM node:13.12.0-alpine

# Work in the membership-portal-ui directory
WORKDIR /var/www/membership-portal
COPY membership-portal-ui/package.json ./

# Install Node pakcages
RUN yarn

# Start the development server
CMD ["/bin/sh", "-c", "make setup && (node -e 'require(\"bcryptjs\")' || npm rebuild bcryptjs --build-from-source) && yarn dev"]
