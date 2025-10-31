# syntax=docker/dockerfile:1

# Build stage
FROM node:20-alpine AS deps
WORKDIR /app
# Install OS deps that may be needed for builds
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
# Prefer pnpm or yarn if lockfile exists; default to npm
RUN if [ -f pnpm-lock.yaml ]; then npm i -g pnpm && pnpm i --frozen-lockfile; \
    elif [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
    else npm ci; fi

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Ensure production build (uses next.config.mjs with output=standalone)
RUN npm run build

# Runtime stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Copy the standalone server output and public assets
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
# Expose Next.js default port; you can override with PORT
ENV PORT=3000
EXPOSE 3000
CMD ["node", "server.js"]
