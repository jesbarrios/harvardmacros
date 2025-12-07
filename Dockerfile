# Dockerfile for backend deployment (Fly.io, Railway, etc.)
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (production only)
RUN npm install --production

# Copy server code
COPY server ./server

# Expose port (will be overridden by hosting provider)
EXPOSE 8080

# Start the server
CMD ["node", "server/index.js"]

