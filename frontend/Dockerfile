# Need a custom image here so that we can incorporate an npm build too
# Alpine is super light
FROM alpine:3.8

# Download and install packages
RUN apk add -U nginx python make g++ nodejs npm yarn

# Create directories
#   /working is the build directory
#   /static is the directory linked to nginx (serves static content)
RUN mkdir -p /var/www/membership/working && \
    mkdir -p /var/www/membership/static && \
    mkdir -p /var/www/membership/static/build

# Install the required packages to build the frontend
WORKDIR /var/www/membership/working
COPY package.json yarn.lock /var/www/membership/working/
RUN yarn  --pure-lockfile

# Copy the source files
COPY pages/ /var/www/membership/working/pages/
COPY src/ /var/www/membership/working/src/
COPY .babelrc *.js *.json /var/www/membership/working/

# build and copy files to server root
RUN yarn build && \
    cp -rv pages/* ../static/ && \
    cp -rv lib/build/* ../static/build/

# Use separate build stage to serve files. This reduces the image size drastically
FROM alpine:3.5

# add nginx
RUN apk add -U nginx

# Copy the configuration file
RUN mkdir -p /run/nginx
COPY conf/ /etc/nginx/

# Copy the build files from the previous stage
WORKDIR /var/www/membership/static
COPY --from=0 /var/www/membership/static /var/www/membership/static

# Run the server
CMD ["nginx", "-g", "daemon off;"]
