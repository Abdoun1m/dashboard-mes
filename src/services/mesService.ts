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
import { clamp, safePercentage } from '../utils/format';

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

const clone = <T>(payload: T): T => structuredClone(payload);

const buildUrl = (path: string): string => {
  const base = API_BASE_URL.replace(/\/$/, '');
  return `${base}${path}`;
};

interface FallbackContext {
  wasFallback: boolean;
  reason?: string;
}

const fallbackContext: FallbackContext = { wasFallback: false };

export const getLastFallbackReason = (): FallbackContext => ({ ...fallbackContext });

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
  postProcess?: (payload: T, isFallback: boolean) => T
): Promise<{ data: T; isFallback: boolean }> => {
  const mode = getDataSourceMode();
  if (mode === 'mock') {
    const mockPayload = fallback();
    fallbackContext.wasFallback = true;
    fallbackContext.reason = 'Mock mode enabled by user';
    return { data: postProcess ? postProcess(mockPayload, true) : mockPayload, isFallback: true };
  }

  if (!API_ENABLED_BY_ENV) {
    const mockPayload = fallback();
    fallbackContext.wasFallback = true;
    fallbackContext.reason = 'API disabled by environment (VITE_DISABLE_API=1)';
    return { data: postProcess ? postProcess(mockPayload, true) : mockPayload, isFallback: true };
  }

  try {
    const payload = await fetchJsonWithTimeout<T>(path);
    fallbackContext.wasFallback = false;
    fallbackContext.reason = undefined;
    return { data: postProcess ? postProcess(payload, false) : payload, isFallback: false };
  } catch (error) {
    console.warn(`[DataProtect MES] API ${path} unavailable, fallback to mocks.`, error);
    const mockPayload = fallback();
    fallbackContext.wasFallback = true;
    fallbackContext.reason = error instanceof Error ? error.message : 'API unreachable';
    return { data: postProcess ? postProcess(mockPayload, true) : mockPayload, isFallback: true };
  }
};

export const getOverview = async (): Promise<OverviewPayload> => {
  await wait();
  const { data, isFallback } = await withFallback(
    '/api/overview',
    () => clone(overviewMock),
    (payload, isFallback) => {
      // Ensure required fields exist, but never replace valid values
      payload.scores = payload.scores ?? { energy: 0, factory: 0, rail: 0, global: 0 };
      payload.railauto = payload.railauto ?? { completedSteps: 0, progressPct: 0 };
      payload.powergrid = payload.powergrid ?? { tap: 0, tcp: 0, delta: 0, totalProduction: 0 };
      
      // If fallback, add flag to indicate estimated data
      if (isFallback) {
        (payload as any)._isFallback = true;
      }
      return payload;
    }
  );
  return data;
};

export const getPowerGridSummary = async (): Promise<PowerGridSummary> => {
  await wait();
  const { data, isFallback } = await withFallback(
    '/api/powergrid/summary',
    () => clone(powerGridMock),
    (payload, isFallback) => {
      // Only ensure delta is computed if both tap and tcp are present
      if (payload.delta === undefined && payload.tap !== undefined && payload.tcp !== undefined) {
        payload.delta = Number((Number(payload.tap) - Number(payload.tcp)).toFixed(1));
      }
      
      // Validate percentage fields
      if (payload.sourceMix) {
        const mix = payload.sourceMix;
        if (mix.PE !== undefined) mix.PE = safePercentage(mix.PE);
        if (mix.FS !== undefined) mix.FS = safePercentage(mix.FS);
        if (mix.GS !== undefined) mix.GS = safePercentage(mix.GS);
        if (mix.pe !== undefined) mix.pe = safePercentage(mix.pe);
        if (mix.fs !== undefined) mix.fs = safePercentage(mix.fs);
        if (mix.gs !== undefined) mix.gs = safePercentage(mix.gs);
        if (mix.windPct !== undefined) mix.windPct = safePercentage(mix.windPct);
        if (mix.solarPct !== undefined) mix.solarPct = safePercentage(mix.solarPct);
        if (mix.gasPct !== undefined) mix.gasPct = safePercentage(mix.gasPct);
      }
      
      // Preserve metadata flags
      if (isFallback) {
        payload.fallback = true;
      }
      return payload;
    }
  );
  return data;
};

export const getFactorySummary = async (): Promise<FactorySummary> => {
  await wait();
  const { data, isFallback } = await withFallback(
    '/api/factory/summary',
    () => clone(factoryMock),
    (payload, isFallback) => {
      // Ensure required fields exist
      payload.tanks = payload.tanks ?? { tank1Low: 0, tank1High: 0, tank2Low: 0, tank2High: 0 };
      
      // Validate percentage fields: tank levels and efficiencyScore
      if (payload.tanks.tank1Low !== undefined) {
        payload.tanks.tank1Low = safePercentage(payload.tanks.tank1Low);
      }
      if (payload.tanks.tank1High !== undefined) {
        payload.tanks.tank1High = safePercentage(payload.tanks.tank1High);
      }
      if (payload.tanks.tank2Low !== undefined) {
        payload.tanks.tank2Low = safePercentage(payload.tanks.tank2Low);
      }
      if (payload.tanks.tank2High !== undefined) {
        payload.tanks.tank2High = safePercentage(payload.tanks.tank2High);
      }
      if (payload.efficiencyScore !== undefined) {
        payload.efficiencyScore = safePercentage(payload.efficiencyScore);
      }
      
      // Preserve metadata flags
      if (isFallback) {
        payload.fallback = true;
      }
      return payload;
    }
  );
  return data;
};

export const getRailSummary = async (): Promise<RailSummary> => {
  await wait();
  const { data, isFallback } = await withFallback(
    '/api/railauto/summary',
    () => clone(railAutoMock),
    (payload, isFallback) => {
      // Validate progress percentage
      if (payload.progress !== undefined) {
        payload.progress = safePercentage(payload.progress);
      }
      
      // Compute derived fields from API data
      // completedSteps is derived from progress percentage
      if (payload.progress !== undefined && payload.progress !== null) {
        payload.completedSteps = clamp(Math.round((Number(payload.progress) / 100) * 4), 0, 4);
      } else {
        payload.completedSteps = payload.completedSteps ?? 0;
      }
      
      // Compute step indicators based on completedSteps
      payload.step1 = 1;
      payload.step2 = (payload.completedSteps ?? 0) >= 2 ? 1 : 0;
      payload.step3 = (payload.completedSteps ?? 0) >= 3 ? 1 : 0;
      payload.step4 = (payload.completedSteps ?? 0) >= 4 ? 1 : 0;
      
      // Preserve metadata flags
      if (isFallback) {
        payload.fallback = true;
      }
      return payload;
    }
  );
  return data;
};

export const getAlerts = async (): Promise<AlertsPayload> => {
  await wait(180);
  const { data, isFallback } = await withFallback(
    '/api/alerts',
    () => clone(alertsMock),
    (payload, isFallback) => {
      // Preserve metadata flags
      if (isFallback) {
        payload.fallback = true;
      }
      return payload;
    }
  );
  return data;
};
