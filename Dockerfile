# load the alpine base image
FROM alpine:3.7 as build

RUN apk add -U python make gcc g++ nodejs && \
    npm install -g yarn

# create the working directory
RUN mkdir -p /var/www/membership

# copy the package.json and shinkwrap file to app location
# copy the node_modules to app location 
COPY package.json yarn.lock /var/www/membership/
RUN cd /var/www/membership && yarn install && npm rebuild bcrypt --build-from-source

FROM alpine:3.7
RUN apk add -U 'nodejs<8.12.0' && \
    npm install -g yarn

# set the working direction and copy the source
WORKDIR /var/www/membership
COPY --from=build /var/www/membership/node_modules/ /var/www/membership/node_modules
COPY . /var/www/membership

# build the typescript project and move the session secret
RUN yarn build && \
    mv SESSION_SECRET dist/app/config/SESSION_SECRET

# open a port and start the server
EXPOSE 8080
CMD ["yarn", "start"]
