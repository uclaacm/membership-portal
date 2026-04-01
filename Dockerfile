FROM node:18-alpine

RUN apk add --no-cache python3 make gcc g++
ENV PYTHONPATH /usr/lib/python3.9/site-packages

# create the working directory
RUN mkdir -p /var/www/membership

# copy the package.json and yarn.lock files to app location
COPY package.json yarn.lock /var/www/membership/
RUN cd /var/www/membership && yarn install

# set the working direction and copy the source
WORKDIR /var/www/membership
COPY . /var/www/membership
RUN if [ ! -f app/config/SESSION_SECRET ]; then \
        cat /dev/urandom | od -N 32 -t x4 -An | tr -d '\n ' > app/config/SESSION_SECRET; \
    fi

# open a port and start the server
EXPOSE 8080
CMD ["sh", "-c", "node scripts/db-init.js && npx sequelize-cli db:migrate && yarn start"]
