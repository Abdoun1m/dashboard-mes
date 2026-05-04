const DEFAULT_BASE_URL = 'http://192.168.20.10:1880';
const REQUEST_TIMEOUT_MS = 2600;

export const MES_API_BASE_URL = (import.meta.env.VITE_MES_API_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, '');

export interface MesFetchMeta {
  responseTimeMs: number;
  status: number | null;
  ok: boolean;
  checkedAt: number;
}

export interface MesFetchResult<T> {
  payload: T | null;
  meta: MesFetchMeta;
  error?: string;
}

export const buildMesUrl = (path: string): string => `${MES_API_BASE_URL}${path}`;

export const fetchJson = async <T>(path: string, timeoutMs = REQUEST_TIMEOUT_MS): Promise<MesFetchResult<T>> => {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  const started = performance.now();

  try {
    const response = await fetch(buildMesUrl(path), {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
      signal: controller.signal
    });

    const responseTimeMs = Math.round(performance.now() - started);
    if (!response.ok) {
      return {
        payload: null,
        meta: {
          responseTimeMs,
          status: response.status,
          ok: false,
          checkedAt: Date.now()
        },
        error: `HTTP ${response.status}`
      };
    }

    const payload = (await response.json()) as T;
    return {
      payload,
      meta: {
        responseTimeMs,
        status: response.status,
        ok: true,
        checkedAt: Date.now()
      }
    };
  } catch (error) {
    return {
      payload: null,
      meta: {
        responseTimeMs: Math.round(performance.now() - started),
        status: null,
        ok: false,
        checkedAt: Date.now()
      },
      error: error instanceof Error ? error.message : 'Network error'
    };
  } finally {
    window.clearTimeout(timeout);
  }
};

export const MES_ENDPOINTS = [
  { key: 'mesOverview', label: 'MES Overview', path: '/api/mes/overview' },
  { key: 'mesHealth', label: 'MES Health', path: '/api/mes/health' },
  { key: 'mesFreshness', label: 'MES Freshness', path: '/api/mes/freshness' },
  { key: 'mesAlerts', label: 'MES Alerts', path: '/api/mes/alerts' },
  { key: 'mesPipeline', label: 'Pipeline', path: '/api/mes/pipeline' },
  { key: 'mesRaw', label: 'Raw Snapshot', path: '/api/mes/raw-snapshot' },
  { key: 'powergridOverview', label: 'PowerGrid Overview', path: '/api/powergrid/overview' },
  { key: 'powergridProduction', label: 'Production', path: '/api/powergrid/production' },
  { key: 'powergridConsumption', label: 'Consumption', path: '/api/powergrid/consumption' },
  { key: 'powergridSourceMix', label: 'Source Mix', path: '/api/powergrid/source-mix' },
  { key: 'powergridLosses', label: 'Losses', path: '/api/powergrid/losses' },
  { key: 'powergridReserve', label: 'Reserve', path: '/api/powergrid/reserve' },
  { key: 'powergridServed', label: 'Served Status', path: '/api/powergrid/served-status' },
  { key: 'powergridEnergyScore', label: 'Energy Score', path: '/api/powergrid/energy-score' },
  { key: 'powergridAnomaly', label: 'Anomaly Summary', path: '/api/powergrid/anomaly-summary' },
  { key: 'factoryOverview', label: 'Factory Overview', path: '/api/factory/overview' },
  { key: 'factoryState', label: 'Factory State', path: '/api/factory/state' },
  { key: 'factoryTanksShadow', label: 'Tank Shadow', path: '/api/factory/tanks-shadow' },
  { key: 'factoryCycle', label: 'Factory Cycle', path: '/api/factory/cycle' },
  { key: 'factoryBottling', label: 'Bottling Readiness', path: '/api/factory/bottling-readiness' },
  { key: 'factoryProcess', label: 'Process Score', path: '/api/factory/process-score' },
  { key: 'factoryRisk', label: 'Operational Risk', path: '/api/factory/operational-risk' },
  { key: 'factoryAvailability', label: 'Availability', path: '/api/factory/availability' },
  { key: 'factoryAlarms', label: 'Alarms', path: '/api/factory/alarms' },
  { key: 'railOverview', label: 'Rail Overview', path: '/api/rail/auto-overview' },
  { key: 'railProgress', label: 'Rail Progress', path: '/api/rail/auto-progress' },
  { key: 'railManualRoutes', label: 'Manual Routes', path: '/api/rail/routes' },
  { key: 'railConflicts', label: 'Conflicts', path: '/api/rail/conflicts' },
  { key: 'railThroughput', label: 'Throughput', path: '/api/rail/throughput' },
  { key: 'railSafetyScore', label: 'Safety Score', path: '/api/rail/safety-score' },
  { key: 'railRoutingScore', label: 'Routing Score', path: '/api/rail/routing-score' },
  { key: 'railGlobalFault', label: 'Global Fault', path: '/api/rail/global-fault' },
  { key: 'railCompletion', label: 'Completion', path: '/api/rail/completion' },
  { key: 'mesDocs', label: 'API Docs', path: '/api/mes/docs' },
  { key: 'mesCatalog', label: 'KPI Catalog', path: '/api/mes/kpi-catalog' }
] as const;

export const DIAGNOSTIC_ENDPOINTS = MES_ENDPOINTS.map(({ key, label, path }) => ({ key, label, path }));

export const pickNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

export const pickFromObject = (source: Record<string, unknown> | null | undefined, keys: string[]): number | null => {
  if (!source) return null;
  for (const key of keys) {
    const value = pickNumber(source[key]);
    if (value !== null) return value;
  }
  return null;
};

export interface DerivedPowerGrid {
  tap: number | null;
  tcp: number | null;
  delta: number | null;
  fallbackTcp: boolean;
}

export const computeDerivedClientSideFallbacks = (payload: Record<string, unknown> | null): DerivedPowerGrid => {
  const tap = pickFromObject(payload, ['tap', 'TAP', 'production', 'totalProduction', 'power']);
  const tcp = pickFromObject(payload, ['tcp', 'TCP', 'consumption', 'totalConsumption']);
  const delta = pickFromObject(payload, ['delta', 'Delta', 'balance']);

  const factoryDemand = pickFromObject(payload, ['factoryDemand', 'FactoryDemand', 'factory_demand']);
  const homesDemand = pickFromObject(payload, ['homesDemand', 'HomesDemand', 'homes_demand']);
  const railwayDemand = pickFromObject(payload, ['railwayDemand', 'RailwayDemand', 'rail_demand']);
  const losses = pickFromObject(payload, ['losses', 'Losses']);

  if (tcp === null && factoryDemand !== null && homesDemand !== null && railwayDemand !== null && losses !== null) {
    const fallbackTcp = factoryDemand + homesDemand + railwayDemand + losses;
    return {
      tap,
      tcp: fallbackTcp,
      delta: tap !== null ? tap - fallbackTcp : null,
      fallbackTcp: true
    };
  }

  return {
    tap,
    tcp,
    delta: delta ?? (tap !== null && tcp !== null ? tap - tcp : null),
    fallbackTcp: false
  };
};
