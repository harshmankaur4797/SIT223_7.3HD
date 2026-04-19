# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --omit=dev

# Stage 2: Production
FROM node:18-alpine

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app/backend

# Copy from builder
COPY --from=builder /app/backend/node_modules ./node_modules
COPY backend/src ./src
COPY backend/package.json ./

# Security: run as non-root user
USER appuser

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

CMD ["node", "src/server.js"]
