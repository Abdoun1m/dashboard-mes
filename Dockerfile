# Dockerfile for DataProtect MES Dashboard
# Self-contained: clones repo, builds, and serves
# Usage: docker build -t dashboard-mes:latest ./mes

# ============================================================================
# Stage 1: Builder
# ============================================================================
FROM node:20-alpine AS builder

WORKDIR /build

# Clone frontend from GitHub (public repo)
RUN git clone https://github.com/Abdoun1m/dashboard-mes.git .

# Install dependencies
RUN npm install

# Set environment for build
ENV VITE_API_BASE_URL=http://localhost:1880
ENV VITE_DISABLE_API=0

# Build React app (outputs to dist/)
RUN npm run build

# ============================================================================
# Stage 2: Runtime (Nginx)
# ============================================================================
FROM nginx:alpine

# Copy built app to nginx
COPY --from=builder /build/dist /usr/share/nginx/html

# Copy nginx config
COPY --from=builder /build/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

