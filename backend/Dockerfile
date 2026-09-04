# Multi-stage Dockerfile for Strapi CMS with Bun
# Stage 1: Build & Dependencies
FROM oven/bun:1-alpine AS builder

WORKDIR /app

# Install build dependencies if needed
RUN apk update && apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev vips-dev git

COPY package.json bun.lock* ./
RUN bun install

COPY . .
ENV NODE_ENV=production
RUN bun run build

# Stage 2: Production Runner
FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache vips-dev

ENV NODE_ENV=production

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.strapi ./.strapi
COPY --from=builder /app/public ./public
COPY --from=builder /app/config ./config
COPY --from=builder /app/database ./database
COPY --from=builder /app/src ./src
COPY --from=builder /app/favicon.png ./
COPY --from=builder /app/tsconfig.json ./

EXPOSE 1337

CMD ["npm", "run", "start"]
