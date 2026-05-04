# Quick Start - 3 Steps to Production

## Step 1: Windows (5 min)

```powershell
# Create and copy images
mkdir public
Copy-Item dataprotect_mes_logo*.png public\

# Stage files
cd c:\path\to\dashboard-mes
git add public/ .env.production *.md Dockerfile
git commit -m "fix: frontend integration & docker deployment"
git push
```

## Step 2: GitHub (2 min)

Go to: `github.com/Abdoun1m/dashboard-mes/settings`
→ Find "Change repository visibility"
→ Select "Public"
→ Confirm

## Step 3: Kali (8 min)

```bash
cd /opt
git clone https://github.com/Abdoun1m/dashboard-mes.git
cd dashboard-mes

# Build and run
docker build -t dashboard-mes:latest .
docker run -d --name dashboard-mes -p 3000:80 dashboard-mes:latest

# Verify
curl http://localhost:3000/api/overview
```

**Access**: `http://192.168.20.10:3000`

---

## What's Working

| Component | Status | Port |
|-----------|--------|------|
| Node-RED APIs | ✅ Working | 1880 |
| React Frontend | ✅ Ready | 3000 (Docker) |
| Images | ✅ Public folder | Via Nginx |
| API Proxy | ✅ nginx.conf | /api/ → 1880 |
| Environment | ✅ Fixed | VITE_API_BASE_URL + VITE_DISABLE_API=0 |

---

## File Changes

✅ `.env.production` - API URL fixed
✅ `Dockerfile` - Images included
✅ `public/` - New folder (create on Windows)
✅ Docs: `FRONTEND_FIXES_APPLIED.md`, `DOCKER_DEPLOYMENT_GUIDE.md`, `GITHUB_KALI_SETUP.md`, `DEPLOYMENT_READY.md`

---

## If Something Breaks

**Images 404?**
```bash
docker exec dashboard-mes ls /usr/share/nginx/html/
```

**API 404?**
```bash
curl http://192.168.20.10:1880/api/overview
```

**Charts empty?**
- Browser → DevTools → Clear All (cache + localStorage)
- Hard refresh: Ctrl+Shift+R
