# load the alpine base image
FROM alpine:3.8

RUN apk add -U python make gcc g++ nodejs yarn npm

# create the working directory
RUN mkdir -p /var/www/membership

# copy the package.json and shinkwrap file to app location
# copy the node_modules to app location 
COPY package.json yarn.lock /var/www/membership/
RUN cd /var/www/membership && yarn && npm rebuild bcrypt --build-from-source

# set the working direction and copy the source
WORKDIR /var/www/membership
COPY . /var/www/membership
RUN make setup

# open a port and start the server
EXPOSE 8080
CMD ["node", "index"]
