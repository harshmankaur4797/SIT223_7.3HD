# Stage 1: Build Frontend
FROM node:18 AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Build Backend
FROM node:18-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --omit=dev

# Stage 3: Production
FROM node:18-alpine
LABEL maintainer="harshmankaur4797"
LABEL status="HD-Ready"

# Create non-root user for security (HD requirement)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy built frontend
COPY --from=frontend-builder /app/dist ./dist

# Copy backend dependencies
COPY --from=backend-builder /app/backend/node_modules ./backend/node_modules

# Copy backend source and metadata
COPY backend/src ./backend/src
COPY backend/package.json ./backend/

# Security: run as non-root user
USER appuser

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

WORKDIR /app/backend
CMD ["node", "src/server.js"]
