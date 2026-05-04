# Frontend Fixes Applied

## Problems Fixed

### ✅ 1. **Wrong Environment Variable Name**
- **Problem**: `.env.production` used `VITE_MES_API_BASE_URL` but code expected `VITE_API_BASE_URL`
- **Fix**: Updated `.env.production` and `.env.example` to use correct var name: `VITE_API_BASE_URL`

### ✅ 2. **API Base URL Wrong**
- **Problem**: API_BASE_URL was set to `/` (same-origin), but Node-RED is at `192.168.20.10:1880`
- **Fix**: Set `VITE_API_BASE_URL=http://192.168.20.10:1880`

### ✅ 3. **API Was Disabled by Default**
- **Problem**: `VITE_DISABLE_API` was not set, defaulting to `'1'` (disabled), forcing mock mode
- **Fix**: Added `VITE_DISABLE_API=0` to enable live API

## Environment Files Updated

### `.env.production`
```env
VITE_API_BASE_URL=http://192.168.20.10:1880
VITE_DISABLE_API=0
```

### `.env.example`
```env
VITE_API_BASE_URL=http://192.168.20.10:1880
VITE_DISABLE_API=0
```

## Next Steps

1. **Rebuild React app**:
   ```bash
   npm run build
   ```

2. **Clear browser cache**:
   - Open DevTools → Application → Clear All Site Data
   - Or do a hard refresh: `Ctrl+Shift+R` (Windows) / `Cmd+Shift+R` (Mac)

3. **Restart dev server** (if using `npm run dev`):
   ```bash
   npm run dev
   ```

4. **Verify API is live**:
   - Open DevTools → Network tab
   - Refresh page
   - Check requests to `/api/overview`, `/api/powergrid/summary`, etc.
   - Should see 200 responses with real data from Node-RED

## React Query Cache

React Query may have cached failed responses. The browser cache clear above will handle this, but you can also force invalidation by:
1. Opening DevTools
2. Going to Application → Local Storage
3. Looking for entries starting with `@tanstack/react-query`
4. Deleting them

## Verification Checklist

- [ ] `.env.production` has correct `VITE_API_BASE_URL` pointing to Node-RED
- [ ] `VITE_DISABLE_API=0` is set (not '1' or missing)
- [ ] Run `npm run build` to create production build
- [ ] Browser cache is cleared (hard refresh or DevTools clear)
- [ ] Network tab shows requests to `http://192.168.20.10:1880/api/*`
- [ ] Responses return 200 with real data (not mock)
- [ ] Charts/graphs populate with real values
- [ ] Data updates every 2 seconds

## API Health Endpoint

To verify all 5 endpoints are working, from Kali:
```bash
curl -s http://192.168.20.10:1880/api/overview | jq
curl -s http://192.168.20.10:1880/api/powergrid/summary | jq
curl -s http://192.168.20.10:1880/api/factory/summary | jq
curl -s http://192.168.20.10:1880/api/railauto/summary | jq
curl -s http://192.168.20.10:1880/api/alerts | jq
```

All should return **200 OK** with real data (not empty/null).

## Data Shape Notes

The Node-RED endpoints return properly formatted JSON:
- **overview**: PowerGrid, Factory, RailAuto objects with scores
- **powergrid/summary**: Numeric values (tap, tcp, delta) + sourceMix object
- **factory/summary**: Factory state + tank levels  
- **railauto/summary**: Progress % + completed steps
- **alerts**: Array of active alerts

Frontend components are configured to accept these shapes. No transformation needed.
