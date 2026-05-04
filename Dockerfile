# ---------- Stage 1: Build React app ----------
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

# Copy all source files including public folder
COPY . .

# Ensure public folder exists with images
RUN mkdir -p public && \
    if [ ! -f public/dataprotect_mes_logo.png ]; then \
      echo "Warning: images not in public folder, checking root..."; \
      [ -f dataprotect_mes_logo.png ] && cp dataprotect_mes_logo.png public/; \
      [ -f dataprotect_mes_logo_dark.png ] && cp dataprotect_mes_logo_dark.png public/; \
    fi

RUN npm run build

# ---------- Stage 2: Serve with Nginx ----------
FROM nginx:alpine

# Remove default static files
RUN rm -rf /usr/share/nginx/html/*

# Copy build output
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
