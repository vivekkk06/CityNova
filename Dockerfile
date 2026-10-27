# ==============================================================================
# CityNova Multi-Stage Production Dockerfile
# ==============================================================================

# ------------------------------------------------------------------------------
# 1. Base Image: Node.js 22 Slim (Debian Bookworm)
# Verified on Docker Hub: Official Node.js image with glibc and native OpenSSL
# ------------------------------------------------------------------------------
FROM node:22-bookworm-slim AS base
WORKDIR /app

# Install OpenSSL and curl (required by Prisma engine and healthchecks)
RUN apt-get update -y && apt-get install -y openssl curl && rm -rf /var/lib/apt/lists/*

# ------------------------------------------------------------------------------
# 2. Dependencies Stage
# ------------------------------------------------------------------------------
FROM base AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# ------------------------------------------------------------------------------
# 3. Builder Stage
# ------------------------------------------------------------------------------
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Configure Prisma provider for PostgreSQL during container build
ARG PRISMA_PROVIDER=postgresql
RUN if [ "$PRISMA_PROVIDER" = "postgresql" ]; then \
      sed -i 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma; \
    fi && npx prisma generate

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Compile Next.js production bundle
RUN npm run build

# ------------------------------------------------------------------------------
# 4. Runner Stage (Production Runtime)
# ------------------------------------------------------------------------------
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy dependencies, compiled application build, and configuration
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src ./src
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/next.config.ts ./next.config.ts

# Ensure uploads directory exists for persistent citizen media
RUN mkdir -p /app/public/uploads

# Copy container entrypoint script and normalize line endings for Linux
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN sed -i 's/\r$//' /usr/local/bin/docker-entrypoint.sh && chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["npm", "start"]

