FROM nginx
FROM node:boron

RUN rm -rvf /etc/nginx/nginx.conf
COPY nginx.conf /etc/nginx/

RUN mkdir -p /var/www/membership/working
RUN mkdir -p /var/www/membership/static
RUN mkdir -p /var/www/membership/static/build

WORKDIR /var/www/membership/working
COPY package.json /var/www/membership/working
RUN npm install

COPY . /var/www/membership/working
RUN npm run build

RUN cp -rv pages/* ../static/
RUN cp -rv lib/build/* ../static/build/

WORKDIR /var/www/membership/static
RUN rm -rfv ../working

EXPOSE 80
CMD ["service","nginx","start"]