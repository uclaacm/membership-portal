# Need a custom image here so that we can incorporate an npm build too
# Alpine is super light
FROM node:18-alpine as build

# Create directories
#   /working is the build directory
#   /static is the directory linked to nginx (serves static content)
RUN mkdir -p /var/www/membership/working && \
    mkdir -p /var/www/membership/static && \
    mkdir -p /var/www/membership/static/build

# Install the required packages to build the frontend
WORKDIR /var/www/membership/working
COPY package.json yarn.lock /var/www/membership/working/
RUN yarn install

# Copy the source files
COPY pages/ /var/www/membership/working/pages/
COPY src/ /var/www/membership/working/src/
COPY .babelrc *.js *.json /var/www/membership/working/

# Inject Google API env vars at build time so Webpack's DefinePlugin can bake them in
ARG GOOGLE_CLIENT_ID
ARG GOOGLE_API_KEY
ARG GOOGLE_AUTH_DOMAIN
ENV GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
ENV GOOGLE_API_KEY=$GOOGLE_API_KEY
ENV GOOGLE_AUTH_DOMAIN=$GOOGLE_AUTH_DOMAIN

# build and copy files to server root
RUN yarn build && \
    cp -rv pages/* ../static/ && \
    cp -rv lib/build/* ../static/build/ && \
    cp -rv lib/index.html ../static/index.html

# Use separate build stage to serve files. This reduces the image size drastically
FROM alpine:3.18

# add nginx
RUN apk add --no-cache nginx

# Copy the configuration file
RUN mkdir -p /run/nginx
COPY conf/ /etc/nginx/

# Copy the build files from the previous stage
WORKDIR /var/www/membership/static
COPY --from=build /var/www/membership/static /var/www/membership/static

# Run the server
CMD ["nginx", "-g", "daemon off;"]
