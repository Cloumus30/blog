# Multi-stage Dockerfile for Strapi CMS with pnpm
# Stage 1: Build & Dependencies
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies for native modules (sharp, vips, etc.)
RUN apk update && apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev vips-dev git

# Enable corepack and prepare pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./

# Install dependencies with BuildKit cache mount for fast builds
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# Copy application source code and build
COPY . .
ENV NODE_ENV=production
RUN pnpm run build

# Stage 2: Production Runner
FROM node:20-alpine AS runner

WORKDIR /app

# Install runtime dependencies (vips for media processing)
RUN apk add --no-cache vips-dev

ENV NODE_ENV=production
ENV PATH="/app/node_modules/.bin:$PATH"

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
