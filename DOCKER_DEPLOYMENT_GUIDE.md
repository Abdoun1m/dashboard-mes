# Docker Deployment Guide - Kali Machine

Complete guide to pull, build, and deploy the DataProtect MES dashboard on Kali.

## Prerequisites

- Docker installed: `docker --version`
- Git installed: `git --version`
- Access to GitHub repo: `github.com/Abdoun1m/dashboard-mes`

## Step 1: Clone Repository on Kali

```bash
cd /opt  # or your preferred location
git clone https://github.com/Abdoun1m/dashboard-mes.git
cd dashboard-mes
```

## Step 2: Verify Directory Structure

The repo should contain:
```
dashboard-mes/
├── Dockerfile
├── nginx.conf
├── package.json
├── src/
│   ├── components/
│   ├── services/
│   └── ...
├── public/                    ← Images go here (created on Windows)
│   ├── dataprotect_mes_logo.png
│   └── dataprotect_mes_logo_dark.png
├── index.html
└── .env.production            ← Already has correct API URL
```

**Important**: If `public/` folder doesn't exist or is empty, create it and add the images:

```bash
mkdir -p public
# Copy the PNG files to this folder (from Windows share or SCP)
# scp user@windows-pc:path/to/dataprotect_mes_logo*.png ./public/
```

## Step 3: Update Environment Variables

Verify `.env.production` has correct settings:

```bash
cat .env.production
```

Should show:
```env
VITE_API_BASE_URL=http://192.168.20.10:1880
VITE_DISABLE_API=0
```

If not, edit and fix:
```bash
cat > .env.production << 'EOF'
VITE_API_BASE_URL=http://192.168.20.10:1880
VITE_DISABLE_API=0
EOF
```

## Step 4: Build Docker Image

```bash
# Navigate to repo root
cd /opt/dashboard-mes

# Build image (replace with your image name/tag)
docker build -t dashboard-mes:latest .

# Verify build succeeded
docker images | grep dashboard-mes
```

**Expected output**:
```
REPOSITORY       TAG       IMAGE ID        CREATED         SIZE
dashboard-mes    latest    abc123def456    2 minutes ago    45MB
```

## Step 5: Run Container

```bash
# Run on port 3000 (change as needed)
docker run -d \
  --name dashboard-mes \
  -p 3000:80 \
  -e VITE_API_BASE_URL=http://192.168.20.10:1880 \
  -e VITE_DISABLE_API=0 \
  dashboard-mes:latest

# Verify container is running
docker ps | grep dashboard-mes
```

## Step 6: Verify Deployment

### Check container logs:
```bash
docker logs dashboard-mes
```

Should see nginx startup messages (no errors).

### Test from Kali:
```bash
# Check nginx is serving frontend
curl -s http://localhost:3000 | head -20

# Check API proxy works
curl -s http://localhost:3000/api/overview | jq .

# Check images load
curl -s http://localhost:3000/dataprotect_mes_logo.png -w "\nStatus: %{http_code}\n"
```

**Expected responses**:
- HTML with React app
- API response with real data from Node-RED
- Image returns 200 (not 404)

## Step 7: Access Dashboard

Open browser and navigate to:
```
http://192.168.20.10:3000
```
or 
```
http://localhost:3000
```

### Verify all 4 charts load:
- ✅ PowerGrid (tap/tcp/delta)
- ✅ Factory (installation/cycles)
- ✅ Railway (progress %)
- ✅ Overview (global score)

### Check Network tab in DevTools:
- Requests to `/api/overview`, `/api/powergrid/summary`, etc.
- Responses show **200 OK** with real data (not 404)
- Images load with 200 status

## Troubleshooting

### Images not showing (404 errors)

**Problem**: Logo images return 404 in browser

**Solutions**:
1. Verify `public/` folder exists in repo:
   ```bash
   ls -la public/
   ```

2. Rebuild Docker image:
   ```bash
   docker stop dashboard-mes
   docker rm dashboard-mes
   docker rmi dashboard-mes:latest
   docker build -t dashboard-mes:latest .
   docker run -d --name dashboard-mes -p 3000:80 dashboard-mes:latest
   ```

3. Check nginx is serving static files correctly:
   ```bash
   docker exec dashboard-mes ls -la /usr/share/nginx/html/
   ```

### API endpoints returning 404 or null

**Problem**: `/api/overview` and other endpoints return 404

**Solution**: Verify Node-RED endpoints are running from Kali:
```bash
curl -s http://192.168.20.10:1880/api/overview | jq
curl -s http://192.168.20.10:1880/api/powergrid/summary | jq
```

Both should return 200 with real data. If not, Node-RED needs to be fixed first.

### API returns 200 but charts are empty

**Problem**: Endpoints work but frontend shows no data

**Solution**:
1. Check browser console for errors: DevTools → Console tab
2. Clear React Query cache:
   - DevTools → Application → Local Storage
   - Delete entries starting with `@tanstack/react-query`
3. Hard refresh: `Ctrl+Shift+R`

### Charts show old/mock data instead of live

**Problem**: Data doesn't update or shows "mock" values

**Cause**: Frontend might be in mock mode

**Fix**:
1. Check .env.production is correct:
   ```bash
   cat .env.production
   ```
   Should have `VITE_DISABLE_API=0`

2. Rebuild Docker image:
   ```bash
   docker build -t dashboard-mes:latest .
   ```

3. Clear localStorage in browser:
   - DevTools → Application → Local Storage → Clear All

## Useful Docker Commands

```bash
# View logs in real-time
docker logs -f dashboard-mes

# Restart container
docker restart dashboard-mes

# Stop container
docker stop dashboard-mes

# Remove container
docker rm dashboard-mes

# Rebuild image (skip cache)
docker build --no-cache -t dashboard-mes:latest .

# Check resource usage
docker stats dashboard-mes

# Open shell in running container
docker exec -it dashboard-mes /bin/sh
```

## API Health Check

Once deployed, verify all 5 endpoints are working:

```bash
# From Kali machine - direct to Node-RED
curl -s http://192.168.20.10:1880/api/overview | jq '.generatedAt'
curl -s http://192.168.20.10:1880/api/powergrid/summary | jq '.tap'
curl -s http://192.168.20.10:1880/api/factory/summary | jq '.efficiencyScore'
curl -s http://192.168.20.10:1880/api/railauto/summary | jq '.progress'
curl -s http://192.168.20.10:1880/api/alerts | jq '.active | length'

# From Kali machine - through Docker proxy
curl -s http://localhost:3000/api/overview | jq '.generatedAt'
```

All should return **200 OK** with real data.

## Production Checklist

- [ ] `public/` folder contains both PNG logo files
- [ ] `.env.production` has `VITE_API_BASE_URL=http://192.168.20.10:1880`
- [ ] `.env.production` has `VITE_DISABLE_API=0`
- [ ] Docker image builds without errors
- [ ] Container runs and nginx starts
- [ ] `http://localhost:3000` loads HTML
- [ ] `/dataprotect_mes_logo.png` returns 200 (not 404)
- [ ] `/api/overview` returns real data
- [ ] All 4 charts populate with data
- [ ] Network requests show `http://192.168.20.10:1880/api/*`
- [ ] Hard refresh shows live data (not mock)

## Summary of Fixes

This deployment includes:

1. ✅ **API Base URL Fixed**: Changed from `/` to `http://192.168.20.10:1880`
2. ✅ **API Enabled**: Set `VITE_DISABLE_API=0` to use live API (not mock)
3. ✅ **Images Served**: `public/` folder ensures logos load via nginx
4. ✅ **Nginx Proxy**: `/api/` requests proxy to Node-RED at `:1880`
5. ✅ **React Query**: Fresh build clears cached failures

All 5 endpoints now work end-to-end: Node-RED → nginx proxy → React frontend → charts
