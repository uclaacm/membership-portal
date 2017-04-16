# load the 6.10.2 LTS node.js image
FROM node:boron

# create the working directory
RUN mkdir -p /var/www/membership


# copy the package.json and shinkwrap file to app location
# copy the node_modules to app location 
COPY package.json /var/www/membership
COPY npm-shrinkwrap.json /var/www/membership
RUN cd /var/www/membership && npm install

# set the working direction and copy the source
WORKDIR /var/www/membership
COPY . /var/www/membership

# open a port and start the server
EXPOSE 8080
CMD ["npm", "start"]