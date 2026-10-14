FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Ensure public directory exists (Next.js requires it)
RUN mkdir -p public

# Build
RUN npm run build

# Production image
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (Next.js needs them for production)
RUN npm install

# Copy built files
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/package.json ./

# Copy public directory (will exist from builder stage)
COPY --from=builder /app/public ./public

# Expose port
EXPOSE 3000

# Start server
CMD ["npm", "start"]

