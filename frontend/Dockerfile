# Install dev deps (needed for the build stage)
FROM node:24-alpine AS development-dependencies-env
COPY . /app
WORKDIR /app
RUN npm ci

# Install prod-only deps (for the final image)
FROM node:24-alpine AS production-dependencies-env
COPY ./package.json package-lock.json /app/
WORKDIR /app
RUN npm ci --omit=dev

# Build stage
FROM node:24-alpine AS build-env
COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
RUN npm run build

# Production stage
FROM node:24-alpine

WORKDIR /app

# Install dumb-init to handle PID 1 properly
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

COPY ./package.json package-lock.json /app/
COPY --from=production-dependencies-env --chown=nodejs:nodejs /app/node_modules /app/node_modules
COPY --from=build-env --chown=nodejs:nodejs /app/build /app/build

# npm is only needed to install the dependencies above — CMD below calls the
# server script directly with `node`, so npm is never invoked at runtime.
# Removing it (and its own bundled dependencies, e.g. a vulnerable `tar` —
# CVE-2026-59873) keeps it out of the final image entirely instead of just
# leaving it unused.
RUN rm -rf /usr/local/lib/node_modules/npm \
           /usr/local/lib/node_modules/corepack \
           /usr/local/bin/npm \
           /usr/local/bin/npx \
           /usr/local/bin/corepack

# Switch to non-root user
USER nodejs

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the server (calling the script directly, bypassing npm, since npm
# was removed from this image above)
CMD ["node", "node_modules/@react-router/serve/dist/cli.js", "./build/server/index.js"]
