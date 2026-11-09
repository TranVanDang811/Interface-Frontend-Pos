# ==========================================
# Stage 1: Build static React SPA
# ==========================================
FROM node:18-alpine AS build
WORKDIR /app

# Cache package dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build production bundle
COPY . .
RUN npm run build

# ==========================================
# Stage 2: Serve static files with Nginx Alpine
# ==========================================
FROM nginx:alpine

# Set timezone to Asia/Ho_Chi_Minh
RUN apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/Asia/Ho_Chi_Minh /etc/localtime && \
    echo "Asia/Ho_Chi_Minh" > /etc/timezone

# Clean default nginx public files
RUN rm -rf /usr/share/nginx/html/*

# Copy built dist files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
