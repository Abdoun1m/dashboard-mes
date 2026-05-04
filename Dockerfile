# ============================================================================
# DataProtect MES Dashboard
# Builds React/Vite frontend from local source and serves it with Nginx
# ============================================================================

# ============================================================================
# Stage 1: Builder
# ============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Use local repository source (no runtime git clone)
COPY package*.json ./
RUN npm install
COPY . .

# Build-time environment variables for Vite
# IMPORTANT:
# Use same-origin API proxy through Nginx.
# The frontend should call /api/... not http://localhost:1880 from the browser.
ENV VITE_DISABLE_API=0
ENV VITE_API_BASE_URL=
ENV VITE_MES_API_BASE_URL=

RUN npm run build

# ============================================================================
# Stage 2: Runtime
# ============================================================================
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

# Copy local nginx.conf from the mes folder, not from GitHub repo
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
