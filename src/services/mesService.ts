import { alertsMock } from '../mocks/alerts.mock';
import { factoryMock } from '../mocks/factory.mock';
import { overviewMock } from '../mocks/overview.mock';
import { powerGridMock } from '../mocks/powergrid.mock';
import { railAutoMock } from '../mocks/railauto.mock';
import type {
    AlertsPayload,
    FactorySummary,
    OverviewPayload,
    PowerGridSummary,
    RailSummary
} from '../types/mes';
import { clamp } from '../utils/format';

const LATENCY_MS = 220;
const HTTP_TIMEOUT_MS = 2600;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const API_ENABLED_BY_ENV = import.meta.env.VITE_DISABLE_API !== '1';
const DATA_MODE_KEY = 'dataprotect-data-mode';
const DATA_MODE_EVENT = 'dataprotect-data-mode-change';
const API_HEALTH_TIMEOUT_MS = 2000;

export const MES_API_ENDPOINTS = [
  '/api/overview',
  '/api/powergrid/summary',
  '/api/factory/summary',
  '/api/railauto/summary',
  '/api/alerts'
] as const;

export type DataSourceMode = 'live' | 'mock';
export type ApiHealthState = 'healthy' | 'degraded' | 'offline' | 'mock' | 'disabled';

export interface ApiEndpointHealth {
  endpoint: string;
  status: ApiHealthState;
  ok: boolean;
  latencyMs: number | null;
  httpStatus: number | null;
  checkedAt: string;
  message: string;
}

export interface RuntimeStatusSnapshot {
  online: boolean;
  mode: DataSourceMode;
  apiEnabledByEnv: boolean;
  apiBaseUrl: string;
}

const getDefaultMode = (): DataSourceMode => (API_ENABLED_BY_ENV ? 'live' : 'mock');

export const getDataSourceMode = (): DataSourceMode => {
  if (typeof window === 'undefined') return getDefaultMode();
  const value = window.localStorage.getItem(DATA_MODE_KEY);
  if (value === 'live' || value === 'mock') return value;
  return getDefaultMode();
};

export const getRuntimeStatusSnapshot = (): RuntimeStatusSnapshot => ({
  online: typeof navigator !== 'undefined' ? navigator.onLine : true,
  mode: getDataSourceMode(),
  apiEnabledByEnv: API_ENABLED_BY_ENV,
  apiBaseUrl: API_BASE_URL || '(même origine)'
});

export const setDataSourceMode = (mode: DataSourceMode): void => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(DATA_MODE_KEY, mode);
  window.dispatchEvent(new CustomEvent<DataSourceMode>(DATA_MODE_EVENT, { detail: mode }));
};

export const subscribeDataSourceMode = (listener: (mode: DataSourceMode) => void): (() => void) => {
  if (typeof window === 'undefined') return () => undefined;

  const customHandler = (event: Event) => {
    const customEvent = event as CustomEvent<DataSourceMode>;
    if (customEvent.detail === 'live' || customEvent.detail === 'mock') {
      listener(customEvent.detail);
    }
  };

  const storageHandler = (event: StorageEvent) => {
    if (event.key !== DATA_MODE_KEY) return;
    const nextMode = event.newValue === 'mock' ? 'mock' : 'live';
    listener(nextMode);
  };

  window.addEventListener(DATA_MODE_EVENT, customHandler as EventListener);
  window.addEventListener('storage', storageHandler);

  return () => {
    window.removeEventListener(DATA_MODE_EVENT, customHandler as EventListener);
    window.removeEventListener('storage', storageHandler);
  };
};

const wait = async (delay = LATENCY_MS): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, delay));
};

const jitter = (value: number, spread: number): number => value + (Math.random() - 0.5) * spread;

const clone = <T>(payload: T): T => structuredClone(payload);

const buildUrl = (path: string): string => {
  const base = API_BASE_URL.replace(/\/$/, '');
  return `${base}${path}`;
};

const probeEndpoint = async (path: string): Promise<ApiEndpointHealth> => {
  const checkedAt = new Date().toISOString();
  const runtime = getRuntimeStatusSnapshot();

  if (!runtime.apiEnabledByEnv) {
    return {
      endpoint: path,
      status: 'disabled',
      ok: false,
      latencyMs: null,
      httpStatus: null,
      checkedAt,
      message: 'API désactivée par configuration (VITE_DISABLE_API=1).'
    };
  }

  if (runtime.mode === 'mock') {
    return {
      endpoint: path,
      status: 'mock',
      ok: true,
      latencyMs: null,
      httpStatus: null,
      checkedAt,
      message: 'Mode mock actif : endpoint bypassé.'
    };
  }

  if (!runtime.online) {
    return {
      endpoint: path,
      status: 'offline',
      ok: false,
      latencyMs: null,
      httpStatus: null,
      checkedAt,
      message: 'Navigateur hors ligne.'
    };
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), API_HEALTH_TIMEOUT_MS);
  const started = performance.now();

  try {
    const response = await fetch(buildUrl(path), {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
      signal: controller.signal
    });

    const latencyMs = Math.round(performance.now() - started);
    return {
      endpoint: path,
      status: response.ok ? 'healthy' : 'degraded',
      ok: response.ok,
      latencyMs,
      httpStatus: response.status,
      checkedAt,
      message: response.ok ? 'Endpoint joignable.' : `Réponse HTTP ${response.status}.`
    };
  } catch (error) {
    return {
      endpoint: path,
      status: 'offline',
      ok: false,
      latencyMs: null,
      httpStatus: null,
      checkedAt,
      message: error instanceof Error ? error.message : 'Erreur de connectivité.'
    };
  } finally {
    window.clearTimeout(timeout);
  }
};

export const getApiHealthReport = async (): Promise<ApiEndpointHealth[]> => {
  const checks = MES_API_ENDPOINTS.map((endpoint) => probeEndpoint(endpoint));
  return Promise.all(checks);
};

const fetchJsonWithTimeout = async <T>(path: string): Promise<T> => {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), HTTP_TIMEOUT_MS);
  try {
    const response = await fetch(buildUrl(path), {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return (await response.json()) as T;
  } finally {
    window.clearTimeout(timeout);
  }
};

const withFallback = async <T>(
  path: string,
  fallback: () => T,
  postProcess?: (payload: T) => T
): Promise<T> => {
  const mode = getDataSourceMode();
  if (mode === 'mock') {
    const mockPayload = fallback();
    return postProcess ? postProcess(mockPayload) : mockPayload;
  }

  if (!API_ENABLED_BY_ENV) {
    const mockPayload = fallback();
    return postProcess ? postProcess(mockPayload) : mockPayload;
  }

  try {
    const payload = await fetchJsonWithTimeout<T>(path);
    return postProcess ? postProcess(payload) : payload;
  } catch (error) {
    console.warn(`[DataProtect MES] API ${path} unavailable, fallback to mocks.`, error);
    const mockPayload = fallback();
    return postProcess ? postProcess(mockPayload) : mockPayload;
  }
};

export const getOverview = async (): Promise<OverviewPayload> => {
  await wait();
  return withFallback('/api/overview', () => clone(overviewMock), (payload) => {
    payload.scores = payload.scores ?? { energy: 0, factory: 0, rail: 0, global: 0 };
    payload.railauto = payload.railauto ?? { completedSteps: 0, progressPct: 0 };
    payload.powergrid = payload.powergrid ?? { tap: 0, tcp: 0, delta: 0, totalProduction: 0 };

    payload.scores.global = clamp(Math.round(jitter(Number(payload.scores.global ?? 0), 4)), 65, 99);
    payload.railauto.progressPct = clamp(Math.round(jitter(Number(payload.railauto.progressPct ?? 0), 6)), 52, 100);
    payload.powergrid.delta = Number(jitter(Number(payload.powergrid.delta ?? 0), 12).toFixed(1));
    return payload;
  });
};

export const getPowerGridSummary = async (): Promise<PowerGridSummary> => {
  await wait();
  return withFallback('/api/powergrid/summary', () => clone(powerGridMock), (payload) => {
    payload.tap = Number(jitter(Number(payload.tap ?? 0), 16).toFixed(1));
    payload.tcp = Number(jitter(Number(payload.tcp ?? 0), 15).toFixed(1));
    payload.delta = Number((Number(payload.tap ?? 0) - Number(payload.tcp ?? 0)).toFixed(1));
    payload.totalProduction = Number(jitter(Number(payload.totalProduction ?? 0), 18).toFixed(1));
    return payload;
  });
};

export const getFactorySummary = async (): Promise<FactorySummary> => {
  await wait();
  return withFallback('/api/factory/summary', () => clone(factoryMock), (payload) => {
    payload.tanks = payload.tanks ?? { tank1Low: 0, tank1High: 0, tank2Low: 0, tank2High: 0 };
    payload.efficiencyScore = clamp(Math.round(jitter(Number(payload.efficiencyScore ?? 0), 5)), 61, 99);
    payload.tanks.tank1Low = clamp(Math.round(jitter(Number(payload.tanks.tank1Low ?? 0), 8)), 5, 95);
    payload.tanks.tank2Low = clamp(Math.round(jitter(Number(payload.tanks.tank2Low ?? 0), 8)), 5, 95);
    payload.tanks.tank1High = 100 - Number(payload.tanks.tank1Low ?? 0);
    payload.tanks.tank2High = 100 - Number(payload.tanks.tank2Low ?? 0);
    return payload;
  });
};

export const getRailSummary = async (): Promise<RailSummary> => {
  await wait();
  return withFallback('/api/railauto/summary', () => clone(railAutoMock), (payload) => {
    payload.progress = clamp(Math.round(jitter(Number(payload.progress ?? 0), 10)), 35, 100);
    payload.ratio = Number(clamp(jitter(Number(payload.ratio ?? 0), 0.08), 0.55, 1).toFixed(2));
    payload.blockRisk = clamp(Math.round(jitter(Number(payload.blockRisk ?? 0), 12)), 0, 85);
    payload.completedSteps = clamp(Math.round((Number(payload.progress ?? 0) / 100) * 4), 0, 4);
    payload.step1 = 1;
    payload.step2 = Number(payload.completedSteps ?? 0) >= 2 ? 1 : 0;
    payload.step3 = Number(payload.completedSteps ?? 0) >= 3 ? 1 : 0;
    payload.step4 = Number(payload.completedSteps ?? 0) >= 4 ? 1 : 0;
    return payload;
  });
};

export const getAlerts = async (): Promise<AlertsPayload> => {
  await wait(180);
  return withFallback('/api/alerts', () => clone(alertsMock));
};
