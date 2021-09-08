# Need a custom image here so that we can incorporate an npm build too
# Alpine is super light
FROM alpine:3.13

# Download and install packages
RUN apk add -U python2 g++ yarn nodejs npm make
ENV PYTHONPATH /usr/lib/python2.7/site-packages

# Work in the membership-portal-ui directory
WORKDIR /var/www/membership-portal

# Start the development server
CMD ["/bin/sh", "-c", "make setup && (node -e 'require(\"bcryptjs\")' || npm rebuild bcryptjs --build-from-source) && yarn dev"]
