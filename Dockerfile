FROM node:18-alpine

WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Copy backend dependencies first for better caching
COPY backend/package*.json ./
RUN npm install --omit=dev

# Copy the rest of the backend code
COPY backend/ ./

EXPOSE 5000

# Command to run the backend application
CMD ["node", "server.js"]
