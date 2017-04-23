# Need a custom image here so that we can incorporate an npm build too
FROM ubuntu:xenial

# Download and install nginx
# RUN echo "deb http://archive.ubuntu.com/ubuntu/ raring main universe" >> /etc/apt/sources.list
RUN apt-get update
RUN apt-get install -y vim curl wget dialog net-tools build-essential nginx

# Download and install nodejs
RUN curl -sL https://deb.nodesource.com/setup_6.x | bash -
RUN apt-get install -y nodejs

# Create directories
#   /working is the build directory
#   /static is the directory linked to nginx (serves static content)
RUN mkdir -p /var/www/membership/working
RUN mkdir -p /var/www/membership/static
RUN mkdir -p /var/www/membership/static/build

# Install the required packages to build the frontend
WORKDIR /var/www/membership/working
COPY package.json /var/www/membership/working
RUN npm install

# Copy the source files and build
COPY . /var/www/membership/working
RUN npm run build

# Copy the built files to the nginx static file server root
RUN cp -rv pages/* ../static/
RUN cp -rv lib/build/* ../static/build/

# Copy the configuration file
COPY nginx.conf /etc/nginx/
WORKDIR /var/www/membership/static

# Run the server
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]