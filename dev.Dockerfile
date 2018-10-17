# Need a custom image here so that we can incorporate an npm build too
# Alpine is super light
FROM alpine:3.8

# Download and install packages
RUN apk add -U python g++ yarn nodejs npm 

# Work in the membership-portal-ui directory
WORKDIR /var/www/membership-portal-ui

# Start the development server
CMD ["/bin/sh", "-c", "make setup && npm rebuild bcrypt --from-source && yarn dev"]