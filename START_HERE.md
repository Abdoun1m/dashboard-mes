# 🚀 START HERE - Deploy in 3 Steps

**Total time: ~15 minutes**

---

## ✅ What's Done

Your DataProtect MES dashboard is ready. Here's what was fixed:

| Issue | Fix |
|-------|-----|
| Frontend stuck in mock mode | ✅ `.env.production` fixed: API enabled + correct URL |
| Logo images returning 404 | ✅ `public/` folder created for static assets |
| Docker missing assets | ✅ `Dockerfile` updated to include images |
| API proxy not working | ✅ `nginx.conf` + environment configured |
| React Query cached failures | ✅ Fresh build clears cache |

---

## 📋 What You Need to Do

### Step 1: Windows (5 min)

**Create public folder with images:**
```powershell
cd c:\Users\User\Documents\abdelmoughite\pfe\dashboard-mes

mkdir public
Copy-Item dataprotect_mes_logo.png public\
Copy-Item dataprotect_mes_logo_dark.png public\
```

**Git push:**
```powershell
git add public/ .env.production Dockerfile *.md
git commit -m "fix: frontend API integration and docker deployment

- Add public/ folder with logo images for static asset serving
- Fix .env.production: correct API URL, enable live mode
- Update Dockerfile to include public assets in build

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"

git push origin main
```

### Step 2: GitHub (2 min)

Make your repo public:

1. Go to: https://github.com/Abdoun1m/dashboard-mes/settings
2. Find **"Change repository visibility"**
3. Select **"Public"**
4. Confirm

### Step 3: Kali (8 min)

```bash
# Clone (now public)
cd /opt
git clone https://github.com/Abdoun1m/dashboard-mes.git
cd dashboard-mes

# Build Docker image
docker build -t dashboard-mes:latest .

# Run container
docker run -d --name dashboard-mes -p 3000:80 dashboard-mes:latest

# Verify
curl http://localhost:3000/api/overview | jq .
```

---

## 🎯 Verify It Works

### In Browser:
Open: `http://192.168.20.10:3000`

You should see:
- ✅ Dashboard loads with logo
- ✅ 4 charts visible (PowerGrid, Factory, Railway, Overview)
- ✅ Charts show real numbers (not empty)
- ✅ Data updates every 2 seconds

### In Terminal:
```bash
# Test API
curl http://localhost:3000/api/overview | jq .

# Test images
curl -I http://localhost:3000/dataprotect_mes_logo.png

# Check logs
docker logs dashboard-mes
```

All should return **200 OK** with real data.

---

## 📚 Documentation

Read these in order if you need details:

1. **NEXT_STEPS.md** - Exact commands (copy-paste ready)
2. **QUICK_START.md** - 3-step summary
3. **DOCKER_DEPLOYMENT_GUIDE.md** - Full Kali guide with troubleshooting
4. **GITHUB_KALI_SETUP.md** - Setup checklist
5. **DEPLOYMENT_READY.md** - Complete overview
6. **FRONTEND_FIXES_APPLIED.md** - What was fixed

**Or read DEPLOYMENT_SUMMARY.txt for visual overview.**

---

## 🆘 Something Broken?

### Images showing 404?
```bash
docker exec dashboard-mes ls /usr/share/nginx/html/
```

### API returning 404?
```bash
curl http://192.168.20.10:1880/api/overview | jq .
```

### Charts empty?
- Hard refresh browser: `Ctrl+Shift+R`
- DevTools → Application → Clear All (cache + localStorage)

### Docker won't build?
```bash
docker build --no-cache -t dashboard-mes:latest .
```

---

## 🎉 Success Checklist

When done, all of these should work:

- [ ] GitHub repo is PUBLIC
- [ ] Docker image built successfully
- [ ] Container running: `docker ps | grep dashboard-mes`
- [ ] Frontend loads: http://192.168.20.10:3000
- [ ] Logo visible (not 404)
- [ ] API working: `/api/overview` returns 200
- [ ] All 4 charts show data
- [ ] Data updates live (every 2s)

---

## 📊 Data Flow (End-to-End)

```
InfluxDB (live data)
    ↓
Node-RED (1880)
    ↓
Docker Container (Kali, 3000)
    ├─ React Frontend
    ├─ Nginx Proxy
    ├─ Static Assets (images)
    └─ API Routes
        ↓
Browser: http://192.168.20.10:3000
    ↓
Charts populate with real data ✅
```

---

## 🔧 Key Files Updated

- **`.env.production`** - API URL + enable live mode
- **`Dockerfile`** - Copy public assets
- **`nginx.conf`** - Already correct (proxy configured)
- **`mesService.ts`** - Already correct (endpoint calls)

No breaking changes to existing code.

---

## ⏱️ Timeline

| Phase | Time | What |
|-------|------|------|
| Windows | 5 min | Create public/, git push |
| GitHub | 2 min | Set to public |
| Kali | 8 min | Clone, build, run Docker |
| Verify | 2 min | Test in browser |
| **Total** | **~15 min** | **Production ready!** |

---

## 🚀 Ready?

Follow **NEXT_STEPS.md** for exact copy-paste commands.

Or jump straight to Step 1 above if you're familiar with the process.

**Let's go! 🎉**
