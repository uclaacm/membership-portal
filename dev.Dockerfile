# Need a custom image here so that we can incorporate an npm build too
# Alpine is super light
FROM alpine:3.13

# Download and install packages
RUN apk add -U python g++ yarn nodejs npm make

# Work in the membership-portal-ui directory
WORKDIR /var/www/membership-portal

# Start the development server
CMD ["/bin/sh", "-c", "make setup && (node -e 'require(\"bcrypt\")' || npm rebuild bcrypt --build-from-source) && yarn dev"]
