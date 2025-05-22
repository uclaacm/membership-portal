# load the alpine base image
# `make: /bin/sh: Operation not permitted` encountered with alpine:3.15
# https://github.com/docker-library/php/issues/1177
FROM node:18-alpine

RUN apk add --no-cache python3 make gcc g++ nodejs yarn npm
ENV PYTHONPATH /usr/lib/python3.8/site-packages

# create the working directory
RUN mkdir -p /var/www/membership

# copy the package.json and yarn.lock files to app location
COPY package.json yarn.lock /var/www/membership/
RUN cd /var/www/membership && yarn install

# set the working direction and copy the source
WORKDIR /var/www/membership
COPY . /var/www/membership
RUN mkdir -p app/config && \
    [ -f app/config/SESSION_SECRET ] || \
    (cat /dev/urandom | od -N 32 -t x4 -An | tr -d '\n ' > app/config/SESSION_SECRET)

# open a port and start the server
EXPOSE 8080
CMD ["yarn", "start"]
