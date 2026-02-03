# Brand-new to making Dockerfiles so if someone from CI/CD can review this plz

# Build Stage
FROM node:18-alpine AS build
WORKDIR /app

# Install deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy the source files
COPY . .

# Inject Google API env vars at build time (must be NEXT_PUBLIC_ to be available client-side)
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ARG NEXT_PUBLIC_GOOGLE_API_KEY
ARG NEXT_PUBLIC_GOOGLE_AUTH_DOMAIN
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID
ENV NEXT_PUBLIC_GOOGLE_API_KEY=$NEXT_PUBLIC_GOOGLE_API_KEY
ENV NEXT_PUBLIC_GOOGLE_AUTH_DOMAIN=$NEXT_PUBLIC_GOOGLE_AUTH_DOMAIN

# Generates .next/standalone
RUN pnpm build

# Prod/Deploy Stage
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Non-root user required by Next.js for some security thing
RUN addgroup --system --gid 1001 next \
  && adduser --system --uid 1001 next

COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static

USER next

EXPOSE 8080

# Start Next.js server
CMD ["node", "server.js"]
