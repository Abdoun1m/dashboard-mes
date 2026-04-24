# DataProtect MES Frontend (Phase 1: Mock-Only)

Interface frontend premium React + TypeScript + Vite pour **DataProtect MES**.

## Stack

- React + TypeScript
- Vite
- Tailwind CSS
- Recharts
- Framer Motion
- Lucide React
- React Router

## Structure

```text
src/
  app/
  components/
    layout/
    cards/
    charts/
    status/
    alerts/
  pages/
  hooks/
  services/
  mocks/
  types/
  utils/
  assets/
```

## Lancer le projet

```bash
npm install
npm run dev
```

## Phase 1 (courante)

- Aucune intégration backend réelle
- Toutes les données viennent de `src/mocks/*.mock.ts`
- Rafraîchissement live simulé via polling frontend (`useLiveData` + jitter dans `mesService`)

## Phase 1.5 (courante maintenant)

- Couche data passée en **API-first** pour:
  - `/api/powergrid/summary`
  - `/api/factory/summary`
  - `/api/railauto/summary`
  - `/api/overview`
- En cas d'échec API (timeout/non-200/réseau), fallback automatique vers mocks (UI inchangée).
- `alerts` reste volontairement mock-only pour l'instant.
- Polling, loading state et error state sont gérés dans les pages via `useLiveData`.

Variables d'environnement optionnelles:

- `VITE_API_BASE_URL` (ex: `http://localhost:1880`)
- `VITE_DISABLE_API=1` pour forcer le mode mock

## Phase 2 (prévue): bascule Node-RED APIs

Service prêt pour migration dans `src/services/mesService.ts`.

### Endpoints cibles

- `/api/powergrid/summary`
- `/api/factory/summary`
- `/api/railauto/summary`
- `/api/overview`
- `/api/alerts`

### Stratégie de switch

1. Remplacer la logique mock dans chaque fonction `get*()` par `fetch()`.
2. Conserver les mêmes contrats TypeScript (`src/types/mes.ts`).
3. Activer `VITE_DATA_MODE=api` pour passer en mode API.
4. Garder les mêmes composants/pages (aucun changement UI majeur requis).

## Branding

- Nom affiché: **DataProtect MES**
- Placeholder logo déjà en place dans la sidebar et topbar
