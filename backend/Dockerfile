# Use official Node.js 18 Bullseye Slim image for reliable native compilation of better-sqlite3
FROM node:18-bullseye-slim

# Install build dependencies for native SQLite (better-sqlite3) compilation
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install production dependencies and compile native addons
RUN npm install --omit=dev

# Copy application source code
COPY . .

# Ensure data directory exists and declare volume for SQLite persistence
RUN mkdir -p /app/data
VOLUME ["/app/data"]

# Expose backend port
EXPOSE 5000

# Set environment defaults
ENV PORT=5000 \
    NODE_ENV=production

# Start the application
CMD ["node", "server.js"]
