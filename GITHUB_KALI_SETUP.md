# GitHub Setup & Kali Deployment

Quick checklist to make repo public and deploy on Kali.

## 1. Make Repository Public on GitHub

Go to: `github.com/Abdoun1m/dashboard-mes/settings`

### In Settings:
1. Scroll to "Danger Zone"
2. Find "Change repository visibility"
3. Click **"Change visibility"**
4. Select **"Public"**
5. Confirm by typing repo name
6. Click **"I understand, change repository visibility"**

**Result**: Repo is now publicly accessible at `https://github.com/Abdoun1m/dashboard-mes`

---

## 2. Prepare Files on Windows (Your Machine)

### Create public folder with images:

Since the tools can't directly create folders, do this manually or via Git:

```powershell
# PowerShell on Windows
mkdir ".\public" -Force
Copy-Item ".\dataprotect_mes_logo.png" ".\public\" -Force
Copy-Item ".\dataprotect_mes_logo_dark.png" ".\public\" -Force

# Verify
dir .\public\
```

### Commit to GitHub:

```powershell
git add public/
git add .env.production
git add FRONTEND_FIXES_APPLIED.md
git add DOCKER_DEPLOYMENT_GUIDE.md
git commit -m "fix: frontend API integration and Docker deployment

- Move logo images to public/ folder for build
- Update .env.production: correct API_BASE_URL and disable mock mode
- Add FRONTEND_FIXES_APPLIED.md documenting environment fixes
- Add DOCKER_DEPLOYMENT_GUIDE.md for Kali deployment
- Update Dockerfile to ensure public assets copy correctly

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"

git push origin main
```

### Push code:
```powershell
git push
```

---

## 3. On Kali Machine - Complete Deployment

### Clone repo:
```bash
cd /opt
sudo git clone https://github.com/Abdoun1m/dashboard-mes.git
cd dashboard-mes
sudo chown -R $USER:$USER .  # Fix permissions
```

### Verify setup:
```bash
# Check public folder has images
ls -la public/

# Check .env.production
cat .env.production

# Check Dockerfile
cat Dockerfile | head -20
```

### Build Docker image:
```bash
docker build -t dashboard-mes:latest .
```

**Build should complete with no errors.**

### Run container:
```bash
docker run -d \
  --name dashboard-mes \
  -p 3000:80 \
  dashboard-mes:latest

# Check it's running
docker ps | grep dashboard-mes
```

### Test deployment:
```bash
# Frontend loads
curl -s http://localhost:3000 | head -20

# Images load
curl -s http://localhost:3000/dataprotect_mes_logo.png -w "\nStatus: %{http_code}\n"

# API works
curl -s http://localhost:3000/api/overview | jq .
```

### Access in browser:
```
http://192.168.20.10:3000
```

✅ If you see:
- Dashboard UI loads
- All 4 charts visible
- Logo images showing
- Data updating from Node-RED

**= Deployment successful!**

---

## 4. Verify API Flow

From Kali, test the complete chain:

```bash
# Node-RED direct (port 1880)
curl -s http://192.168.20.10:1880/api/overview | jq '.kpi'

# Through Docker proxy (port 3000)
curl -s http://localhost:3000/api/overview | jq '.kpi'

# Check images
curl -I http://localhost:3000/dataprotect_mes_logo.png
```

All should return 200 with real data.

---

## Checklist

- [ ] GitHub repo is now **PUBLIC**
- [ ] `public/` folder created with both PNG files
- [ ] `.env.production` committed with correct URLs
- [ ] Code pushed to GitHub
- [ ] Cloned on Kali from GitHub (not scp)
- [ ] Docker image built successfully
- [ ] Container running on port 3000
- [ ] Images loading (no 404s)
- [ ] API endpoints working (200, real data)
- [ ] All 4 charts showing real data
- [ ] Data updates live (not mock)

---

## If Something Breaks

### Images still 404:
```bash
# Check inside container
docker exec dashboard-mes ls -la /usr/share/nginx/html/

# Rebuild
docker stop dashboard-mes && docker rm dashboard-mes
docker rmi dashboard-mes:latest
docker build -t dashboard-mes:latest .
docker run -d --name dashboard-mes -p 3000:80 dashboard-mes:latest
```

### API returns 404:
Verify Node-RED is running and endpoints exist:
```bash
curl -s http://192.168.20.10:1880/api/overview | jq
```

### Charts empty but API works:
- Browser DevTools → Console (check for JS errors)
- Hard refresh: `Ctrl+Shift+R`
- Clear localStorage: DevTools → Application → Clear All

---

## Files Updated

✅ `.env.production` - Correct API URL and disable mock mode
✅ `Dockerfile` - Copy public folder with images
✅ `FRONTEND_FIXES_APPLIED.md` - Documents environment fixes
✅ `DOCKER_DEPLOYMENT_GUIDE.md` - Complete deployment guide
✅ `public/` - New folder with images (create on Windows)

All committed to GitHub and ready to deploy!
