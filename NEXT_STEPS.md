# Next Steps - Execute This

Everything is ready. Follow these exact steps to deploy:

## ⏱️ Total Time: ~15 minutes

---

## 1. CREATE PUBLIC FOLDER (Windows) - 2 min

**Open PowerShell in repo root:**
```powershell
cd c:\Users\User\Documents\abdelmoughite\pfe\dashboard-mes

# Create folder
mkdir public

# Copy PNG files
Copy-Item dataprotect_mes_logo.png public\
Copy-Item dataprotect_mes_logo_dark.png public\

# Verify
dir public\
```

Should show 2 PNG files.

---

## 2. GIT COMMIT & PUSH (Windows) - 3 min

```powershell
# Stage changes
git add public/
git add .env.production
git add Dockerfile
git add *.md

# Verify what's staged
git status

# Commit
git commit -m "fix: frontend API integration and Docker deployment

- Add public/ folder with logo images for static asset serving
- Fix .env.production: update API base URL to Node-RED, disable mock mode
- Update Dockerfile: properly copy public assets during build
- Add comprehensive deployment documentation

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"

# Push
git push origin main
```

**Expected output**: `✓ branch main set up to track origin/main`

---

## 3. MAKE GITHUB PUBLIC (Web) - 2 min

1. Open browser: `https://github.com/Abdoun1m/dashboard-mes/settings`
2. Scroll to **"Danger Zone"**
3. Find **"Change repository visibility"**
4. Click **"Change visibility"**
5. Select **"Public"**
6. Type repo name to confirm: `dashboard-mes`
7. Click **"I understand, change repository visibility"**

**Expected**: ✅ "This repository is now public"

---

## 4. DEPLOY ON KALI (Linux) - 8 min

SSH into Kali machine:
```bash
ssh your-kali-user@192.168.20.X
```

### Clone repo (now possible since it's public):
```bash
cd /opt
sudo git clone https://github.com/Abdoun1m/dashboard-mes.git
cd dashboard-mes
sudo chown -R $USER:$USER .
```

### Build Docker image:
```bash
docker build -t dashboard-mes:latest .
```

**Wait for**: `Successfully tagged dashboard-mes:latest`

### Run container:
```bash
docker run -d --name dashboard-mes -p 3000:80 dashboard-mes:latest

# Verify running
docker ps | grep dashboard-mes
```

**Expected**: Container ID shown in output

---

## 5. TEST DEPLOYMENT (Kali) - 3 min

```bash
# Test frontend loads
curl -s http://localhost:3000 | head -30

# Test images (should return 200)
curl -I http://localhost:3000/dataprotect_mes_logo.png

# Test API works
curl -s http://localhost:3000/api/overview | jq .

# Check logs
docker logs dashboard-mes
```

**Expected responses**:
- HTML with React app
- Images return `200 OK`
- API returns real data (tap, tcp, delta, etc.)
- Logs show nginx startup

---

## 6. VERIFY IN BROWSER - 2 min

Open: `http://192.168.20.10:3000`

### Checklist:
- [ ] Dashboard loads (no errors)
- [ ] Logo images visible (light/dark versions)
- [ ] PowerGrid chart shows (tap, tcp, delta values)
- [ ] Factory chart shows (installation, cycles)
- [ ] Railway chart shows (progress %)
- [ ] Overview shows (global score)
- [ ] Data updates every 2 seconds
- [ ] No red/yellow errors in charts

### DevTools Check (F12):
1. Go to **Network** tab
2. Refresh page
3. Look for requests to `/api/overview`, `/api/powergrid/summary`, etc.
4. All should return **200 OK** with real data
5. No 404 errors
6. No `file://` URLs (means it's not loading from disk)

---

## ✅ Success = All of This Works

| Component | Expected | Status |
|-----------|----------|--------|
| GitHub repo | Public, cloneable | ? |
| Docker build | No errors, image created | ? |
| Container runs | Showing in `docker ps` | ? |
| Frontend loads | HTML in browser | ? |
| Images show | No 404 errors | ? |
| API works | `/api/overview` returns data | ? |
| Charts populate | All 4 visible with data | ? |
| Data live | Updates every 2 seconds | ? |

---

## 🆘 If Something Fails

### Docker build fails:
```bash
# Check logs
docker logs dashboard-mes

# Try rebuild with no cache
docker rm -f dashboard-mes
docker rmi dashboard-mes:latest
docker build --no-cache -t dashboard-mes:latest .
```

### Images still 404:
```bash
# Check inside container
docker exec dashboard-mes ls /usr/share/nginx/html/

# Verify files exist
ls -la public/
```

### API returns 404:
```bash
# Check Node-RED is running
curl -s http://192.168.20.10:1880/api/overview | jq .key

# Should NOT be null/error
```

### Charts empty but no errors:
```bash
# Clear browser cache (DevTools)
# Press: Ctrl+Shift+R (hard refresh)
# Or: DevTools → Application → Clear All
```

---

## 📞 Quick Reference

**Kali useful commands:**
```bash
# View live logs
docker logs -f dashboard-mes

# Restart container
docker restart dashboard-mes

# Remove and restart clean
docker stop dashboard-mes && docker rm dashboard-mes
docker run -d --name dashboard-mes -p 3000:80 dashboard-mes:latest

# Check container stats
docker stats dashboard-mes

# Enter container shell
docker exec -it dashboard-mes sh
```

---

## 🎉 When Everything Works

- ✅ Public GitHub repo accessible
- ✅ Docker image built and running
- ✅ Frontend loads with real data
- ✅ All 4 charts showing live values
- ✅ API calls working (200 responses)
- ✅ Images loading (no 404s)
- ✅ Ready for demonstration!

**Estimated total time: 15 minutes**
