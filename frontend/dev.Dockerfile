# Need a custom image here so that we can incorporate an npm build too
# Alpine is super light
FROM alpine:3.13

# Download and install packages
RUN apk add -U python g++ yarn nodejs npm

# Work in the membership-portal-ui directory
WORKDIR /var/www/membership-portal-ui

# Start the development server
CMD ["/bin/sh", "-c", "(node -e 'require(\"node-sass\")' || npm rebuild node-sass) && yarn dev"]
