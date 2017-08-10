# Need a custom image here so that we can incorporate an npm build too
# Alpine is super light
FROM alpine:3.5

# Download and install packages
RUN apk add -U nginx python make g++ nodejs

# Create directories
#   /working is the build directory
#   /static is the directory linked to nginx (serves static content)
RUN mkdir -p /var/www/membership/working && \
    mkdir -p /var/www/membership/static && \
    mkdir -p /var/www/membership/static/build

# Install the required packages to build the frontend
WORKDIR /var/www/membership/working
COPY *.json /var/www/membership/working/
RUN /usr/bin/node --max_semi_space_size=8 \
                  --max_old_space_size=298 \
                  --max_executable_size=248 \
                  /usr/bin/npm install

# Copy the source files
COPY pages/ /var/www/membership/working/pages/
COPY src/ /var/www/membership/working/src/
COPY .babelrc *.js Makefile /var/www/membership/working/

# build and copy files to server root
RUN make build && \
    cp -rv pages/* ../static/ && \
    cp -rv lib/build/* ../static/build/

# Copy the configuration file
RUN mkdir -p /run/nginx
COPY conf/ /etc/nginx/
WORKDIR /var/www/membership/static

# Run the server
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
