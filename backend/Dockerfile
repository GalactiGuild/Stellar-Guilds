# ============================================
# Stage 1: Dependencies (base for caching)
# ============================================
FROM node:20-alpine AS deps

# Install build dependencies for native modules
RUN apk add --no-cache \
    openssl \
    python3 \
    make \
    g++

WORKDIR /app

# Copy package files first for better layer caching
COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Generate Prisma client
RUN npx prisma generate

# ============================================
# Stage 2: Build
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Install dev dependencies for build
RUN npm ci

# Generate Prisma client (ensure it's available)
RUN npx prisma generate

# Build the application
RUN npm run build

# Prune dev dependencies after build
RUN npm prune --production && \
    npm cache clean --force

# ============================================
# Stage 3: Production
# ============================================
FROM node:20-alpine AS runner

# Install runtime dependencies only
RUN apk add --no-cache \
    openssl \
    dumb-init

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

# Copy built application and dependencies
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma

# Create uploads directory
RUN mkdir -p /app/uploads && \
    chown -R nestjs:nodejs /app/uploads

# Switch to non-root user
USER nestjs

# Expose the application port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/main.js"]
