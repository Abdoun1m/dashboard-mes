# DataProtect MES Frontend (Operational UI)

Industrial OT/MES control-room interface built with React + TypeScript + Vite.

## Stack

- React + TypeScript
- Vite
- Tailwind CSS
- Recharts
- Lucide React
- React Router
- TanStack Query

## Structure

```text
src/
  app/
  components/
    layout/
    kpi/
    charts/
    diagnostics/
  pages/
  hooks/
  services/
  mocks/
  types/
  utils/
  assets/
```

## Run the project

```bash
npm install
npm run dev
```

## Environment

Copy `.env.example` and adjust if needed:

- `VITE_MES_API_BASE_URL` (default `http://192.168.20.10:1880`)

Production Docker builds use `.env.production` with `VITE_MES_API_BASE_URL=/` so the UI calls the local Nginx `/api/` proxy.

## Docker + Nginx

The project ships with a `Dockerfile` and `nginx.conf` for the OT/MES gateway. The Nginx config proxies `/api/` to the Node-RED API.

## Notes

- The UI consumes live API data directly.
- If an endpoint is unavailable, panels show a degraded state.
- TCP falls back to $TCP = FactoryDemand + HomesDemand + RailwayDemand + Losses$ when missing.

## Branding

- Display name: **DataProtect MES**
- Logos are loaded from the public root
