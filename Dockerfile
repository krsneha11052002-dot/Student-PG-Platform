# ─────────────────────────────────────────────
# Stage 1: Build Frontend
# ─────────────────────────────────────────────
FROM node:18-alpine AS frontend-builder

WORKDIR /build

# Copy frontend package files
COPY frontend/package.json frontend/package-lock.json ./

# Install dependencies
RUN npm ci

# Copy ALL frontend source files
COPY frontend/ ./

# Build the React app - outputs to /build/dist
RUN npm run build

# Verify build succeeded
RUN ls -la /build/dist && echo "✅ Frontend build successful"

# ─────────────────────────────────────────────
# Stage 2: Production Backend Server
# ─────────────────────────────────────────────
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nodeuser -u 1001

# Set working directory for backend
WORKDIR /app

# Copy backend package files and install production deps
COPY backend/package.json backend/package-lock.json* ./
RUN npm ci --omit=dev || npm install --omit=dev

# Copy backend source code
COPY backend/ ./

# Copy built frontend dist into /app/public (simpler path)
COPY --from=frontend-builder /build/dist ./public

# Verify everything is in place
RUN ls -la /app/public && echo "✅ Static files ready at /app/public"

# Set ownership
RUN chown -R nodeuser:nodejs /app

USER nodeuser

# Environment
ENV NODE_ENV=production
ENV PORT=5000
ENV STATIC_DIR=/app/public

EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
