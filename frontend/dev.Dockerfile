# Need a custom image here so that we can incorporate an npm build too
# Alpine is super light
FROM node:13.12.0-alpine

# Work in the membership-portal-ui directory
WORKDIR /var/www/membership-portal-ui
COPY membership-portal-ui/package.json ./

# Install Python 2 and other required dependencies
RUN apk update && \
    apk add python2 && \
    apk add make && \
    apk add g++ && \
    yarn

# Add Python 2 to the PATH environment variable
ENV PATH="/usr/bin/python2:${PATH}"

# Start the development server
CMD ["/bin/sh", "-c", "(node -e 'require(\"node-sass\")' || npm rebuild node-sass) && yarn dev"]
