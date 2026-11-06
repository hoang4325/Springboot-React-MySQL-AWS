# Multi-stage build for React Frontend
# Stage 1: Build React static assets with Node.js
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package descriptors first for layer caching
COPY package.json package-lock.json* ./

RUN npm ci || npm install

# Copy application source code
COPY . .

# Build production bundle
RUN npm run build

# Stage 2: Serve static files with Nginx
FROM nginx:1.27-alpine

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build artifacts from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
