FROM node:18-alpine

RUN apk add --no-cache python3 make gcc g++
ENV PYTHONPATH=/usr/lib/python3.9/site-packages

WORKDIR /var/www/membership

# Install deps with ci for reproducible installs (requires package-lock.json)
COPY package.json package-lock.json ./
RUN npm ci

# Copy the source files
COPY . .

RUN if [ ! -f app/config/SESSION_SECRET ]; then \
        cat /dev/urandom | od -N 32 -t x4 -An | tr -d '\n ' > app/config/SESSION_SECRET; \
    fi

# Non-root user
RUN addgroup --system --gid 1001 node_app \
  && adduser --system --uid 1001 node_app
USER node_app

EXPOSE 8080

CMD ["sh", "-c", "node scripts/db-init.js && npx sequelize-cli db:migrate && npm start"]
