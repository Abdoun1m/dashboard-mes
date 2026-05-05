import { alertsMock } from '../mocks/alerts.mock';
import { factoryMock } from '../mocks/factory.mock';
import { overviewMock } from '../mocks/overview.mock';
import { powerGridMock } from '../mocks/powergrid.mock';
import { railAutoMock } from '../mocks/railauto.mock';
import type {
  AlertsPayload,
  ApiMetadata,
  FactorySummary,
  HistoryBalancePoint,
  HistoryDemandPoint,
  HistoryQapPoint,
  HistorySourceMixPoint,
  HistoryThroughputPoint,
  HistoryUptimePoint,
  HistoryValuePoint,
  OverviewPayload,
  PowerGridSummary,
  RailSummary
} from '../types/mes';
import { safeNumber, safePercentage } from '../utils/format';

const LATENCY_MS = 220;
const HTTP_TIMEOUT_MS = 2600;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const API_ENABLED_BY_ENV = import.meta.env.VITE_DISABLE_API !== '1';
const DATA_MODE_KEY = 'dataprotect-data-mode';
const DATA_MODE_EVENT = 'dataprotect-data-mode-change';
const API_HEALTH_TIMEOUT_MS = 2000;

export const MES_API_ENDPOINTS = [
  '/api/overview',
  '/api/powergrid/overview',
  '/api/factory/dashboard',
  '/api/rail/dashboard',
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

interface FallbackContext {
  wasFallback: boolean;
  reason?: string;
}

const fallbackContext: FallbackContext = { wasFallback: false };

const getDefaultMode = (): DataSourceMode => (API_ENABLED_BY_ENV ? 'live' : 'mock');

const wait = async (delay = LATENCY_MS): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, delay));
};

const clone = <T>(payload: T): T => structuredClone(payload);

const buildUrl = (path: string): string => {
  const base = API_BASE_URL.replace(/\/$/, '');
  return `${base}${path}`;
};

const asRecord = (value: unknown): Record<string, unknown> | undefined => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  return value as Record<string, unknown>;
};

const asArray = (value: unknown): Record<string, unknown>[] => {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is Record<string, unknown> => !!item && typeof item === 'object');
};

const toTimestamp = (value: unknown): string | undefined => {
  if (typeof value === 'string' && value.trim()) return value;
  if (typeof value === 'number' && Number.isFinite(value)) return new Date(value).toISOString();
  return undefined;
};

const toBoolean = (value: unknown): boolean | undefined => {
  if (typeof value === 'boolean') return value;
  const num = safeNumber(value);
  if (num !== null) return num !== 0;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['1', 'true', 'yes', 'on', 'active', 'done', 'running', 'operational'].includes(normalized)) return true;
    if (['0', 'false', 'no', 'off', 'idle', 'waiting', 'inactive', 'down'].includes(normalized)) return false;
  }
  return undefined;
};

const pickNumber = (source: Record<string, unknown>, keys: string[]): number | undefined => {
  for (const key of keys) {
    const value = safeNumber(source[key]);
    if (value !== null) return value;
  }
  return undefined;
};

const pickPercent = (source: Record<string, unknown>, keys: string[]): number | undefined => {
  for (const key of keys) {
    const value = safePercentage(source[key]);
    if (value !== undefined) return value;
  }
  return undefined;
};

const pickBoolean = (source: Record<string, unknown>, keys: string[]): boolean | undefined => {
  for (const key of keys) {
    const value = toBoolean(source[key]);
    if (value !== undefined) return value;
  }
  return undefined;
};

const metadataFrom = (source: Record<string, unknown>, isFallback: boolean): ApiMetadata => {
  const rawFallback = toBoolean(source.fallback);
  return {
    generatedAt: typeof source.generatedAt === 'string' ? source.generatedAt : undefined,
    sourceUpdatedAt: typeof source.sourceUpdatedAt === 'string' ? source.sourceUpdatedAt : undefined,
    source: typeof source.source === 'string' ? source.source : isFallback ? 'fallback' : undefined,
    fallback: isFallback || rawFallback === true,
    pointCount: safeNumber(source.pointCount) ?? undefined
  };
};

const normalizeValueHistory = (
  payload: unknown,
  valueKeys: string[] = ['value']
): HistoryValuePoint[] => {
  const rows = asArray(payload);
  const history: HistoryValuePoint[] = [];
  for (const row of rows) {
    const timestamp = toTimestamp(row.timestamp ?? row.time);
    if (!timestamp) continue;
    const value = pickNumber(row, valueKeys);
    if (value === undefined) continue;
    history.push({ timestamp, value });
  }
  return history;
};

const normalizeQapHistory = (payload: unknown): HistoryQapPoint[] => {
  const rows = asArray(payload);
  const history: HistoryQapPoint[] = [];
  for (const row of rows) {
    const timestamp = toTimestamp(row.timestamp ?? row.time);
    if (!timestamp) continue;
    const quality = pickPercent(row, ['quality', 'qualityPercent']);
    const availability = pickPercent(row, ['availability', 'availabilityPercent']);
    const performance = pickPercent(row, ['performance', 'performancePercent']);
    if (quality === undefined || availability === undefined || performance === undefined) continue;
    history.push({ timestamp, quality, availability, performance });
  }
  return history;
};

const normalizeThroughputHistory = (payload: unknown): HistoryThroughputPoint[] => {
  const rows = asArray(payload);
  const history: HistoryThroughputPoint[] = [];
  for (const row of rows) {
    const timestamp = toTimestamp(row.timestamp ?? row.time);
    if (!timestamp) continue;
    const perMin = pickNumber(row, ['perMin', 'throughputPerMin', 'value']);
    const perHour = pickNumber(row, ['perHour', 'throughputPerHour']);
    if (perMin === undefined && perHour === undefined) continue;
    history.push({
      timestamp,
      perMin: perMin ?? 0,
      perHour: perHour ?? 0
    });
  }
  return history;
};

const normalizeUptimeHistory = (payload: unknown): HistoryUptimePoint[] => {
  const rows = asArray(payload);
  const history: HistoryUptimePoint[] = [];
  for (const row of rows) {
    const timestamp = toTimestamp(row.timestamp ?? row.time);
    if (!timestamp) continue;
    const uptimeSeconds = pickNumber(row, ['uptimeSeconds', 'uptime', 'value']);
    const downtimeSeconds = pickNumber(row, ['downtimeSeconds', 'downtime']);
    if (uptimeSeconds === undefined && downtimeSeconds === undefined) continue;
    history.push({
      timestamp,
      uptimeSeconds: uptimeSeconds ?? 0,
      downtimeSeconds: downtimeSeconds ?? 0
    });
  }
  return history;
};

const normalizeBalanceHistory = (payload: unknown): HistoryBalancePoint[] => {
  const rows = asArray(payload);
  const history: HistoryBalancePoint[] = [];
  for (const row of rows) {
    const timestamp = toTimestamp(row.timestamp ?? row.time);
    if (!timestamp) continue;
    const production = pickNumber(row, ['production', 'totalProduction']);
    const consumption = pickNumber(row, ['consumption', 'totalConsumption']);
    if (production === undefined && consumption === undefined) continue;
    history.push({
      timestamp,
      production: production ?? 0,
      consumption: consumption ?? 0
    });
  }
  return history;
};

const normalizeSourceMixHistory = (payload: unknown): HistorySourceMixPoint[] => {
  const rows = asArray(payload);
  const history: HistorySourceMixPoint[] = [];
  for (const row of rows) {
    const timestamp = toTimestamp(row.timestamp ?? row.time);
    if (!timestamp) continue;
    const pe = pickPercent(row, ['pe', 'PE', 'windPct']);
    const fs = pickPercent(row, ['fs', 'FS', 'solarPct']);
    const gs = pickPercent(row, ['gs', 'GS', 'gasPct']);
    if (pe === undefined || fs === undefined || gs === undefined) continue;
    history.push({ timestamp, pe, fs, gs });
  }
  return history;
};

const normalizeDemandHistory = (payload: unknown): HistoryDemandPoint[] => {
  const rows = asArray(payload);
  const history: HistoryDemandPoint[] = [];
  for (const row of rows) {
    const timestamp = toTimestamp(row.timestamp ?? row.time);
    if (!timestamp) continue;
    const factory = pickNumber(row, ['factory', 'factoryDemand']);
    const homes = pickNumber(row, ['homes', 'homesDemand']);
    const railway = pickNumber(row, ['railway', 'railwayDemand']);
    if (factory === undefined && homes === undefined && railway === undefined) continue;
    history.push({
      timestamp,
      factory: factory ?? 0,
      homes: homes ?? 0,
      railway: railway ?? 0
    });
  }
  return history;
};

const getDataRecord = (payload: unknown): Record<string, unknown> => {
  const direct = asRecord(payload);
  if (!direct) return {};
  const nestedPayload = asRecord(direct.payload);
  return nestedPayload ?? direct;
};

const normalizeFactory = (payload: unknown, isFallback: boolean): FactorySummary => {
  const data = getDataRecord(payload);
  const meta = metadataFrom(data, isFallback);
  const tanks = asRecord(data.tanks);
  const tankSummary = asRecord(data.tankSummary);

  const totalCycles = pickNumber(data, ['totalCycles', 'cycleCount', 'MES.TotalCycles']);
  const cycleCount = pickNumber(data, ['cycleCount', 'totalCycles']);
  const cycleActive = pickBoolean(data, ['cycleActive', 'MES.CycleActive']);
  const cycleFinished = pickBoolean(data, ['cycleFinished', 'cycleDone', 'MES.CycleDone']);

  const oee = pickPercent(data, ['oee', 'OEE', 'MES.OEE', 'efficiencyScore']);
  const qualityPercent = pickPercent(data, ['qualityPercent', 'quality', 'MES.QualityPercent']);
  const availabilityPercent = pickPercent(data, ['availabilityPercent', 'availability', 'MES.AvailabilityPercent']);
  const performancePercent = pickPercent(data, ['performancePercent', 'performance', 'MES.PerformancePercent']);
  const loadPercent = pickPercent(data, ['loadPercent', 'MES.LoadPercent']);

  return {
    ...meta,
    installationActive: pickBoolean(data, ['installationActive']) ?? false,
    plantOperational: pickBoolean(data, ['plantOperational']) ?? false,
    cycleActive: cycleActive ?? false,
    cycleFinished: cycleFinished ?? false,
    totalCycles,
    cycleCount,
    recyclingActive: pickBoolean(data, ['recyclingActive']) ?? false,
    oee,
    qualityPercent,
    availabilityPercent,
    performancePercent,
    totalGood: pickNumber(data, ['totalGood', 'MES.TotalGood']),
    totalReject: pickNumber(data, ['totalReject', 'MES.TotalReject']),
    throughputPerMin: pickNumber(data, ['throughputPerMin', 'MES.ThroughputPerMin']),
    throughputPerHour: pickNumber(data, ['throughputPerHour', 'MES.ThroughputPerHour']),
    loadPercent,
    uptimeSeconds: pickNumber(data, ['uptimeSeconds', 'MES.UptimeSeconds']),
    downtimeSeconds: pickNumber(data, ['downtimeSeconds', 'MES.DowntimeSeconds']),
    processState: pickNumber(data, ['processState', 'MES.ProcessState']),
    targetCycleTime: pickNumber(data, ['targetCycleTime', 'MES.TargetCycleTime']),
    actualCycleTime: pickNumber(data, ['actualCycleTime', 'MES.ActualCycleTime']),
    efficiencyScore: oee,
    tanks: {
      tank1Low: tanks ? pickPercent(tanks, ['tank1Low']) : undefined,
      tank1High: tanks ? pickPercent(tanks, ['tank1High']) : undefined,
      tank2Low: tanks ? pickPercent(tanks, ['tank2Low']) : undefined,
      tank2High: tanks ? pickPercent(tanks, ['tank2High']) : undefined
    },
    tankSummary: {
      fullCount: tankSummary ? pickNumber(tankSummary, ['fullCount']) : undefined,
      lowCount: tankSummary ? pickNumber(tankSummary, ['lowCount']) : undefined
    },
    oeeHistory: normalizeValueHistory(data.oeeHistory, ['value', 'oee']),
    qapHistory: normalizeQapHistory(data.qapHistory),
    throughputHistory: normalizeThroughputHistory(data.throughputHistory),
    cycleHistory: normalizeValueHistory(data.cycleHistory, ['value', 'totalCycles']),
    uptimeHistory: normalizeUptimeHistory(data.uptimeHistory)
  };
};

const normalizeRail = (payload: unknown, isFallback: boolean): RailSummary => {
  const data = getDataRecord(payload);
  const meta = metadataFrom(data, isFallback);
  const auto = asRecord(data.railAuto) ?? asRecord(data.railauto) ?? asRecord(data.auto) ?? data;
  const manual = asRecord(data.railManual) ?? asRecord(data.railmanual) ?? asRecord(data.manual) ?? {};

  const progressPct = pickPercent(auto, ['progressPct', 'progress', 'MES.ProgressPercent']) ?? 0;
  const completedSteps = Math.max(0, Math.min(4, Math.round(progressPct / 25)));
  const blockRisk = pickPercent(auto, ['blockRisk']) ?? undefined;
  const safetyScore = pickPercent(manual, ['safetyScore', 'MES.SafetyScore']);
  const routingScore = pickPercent(manual, ['routingScore', 'MES.RoutingScore']);

  return {
    ...meta,
    railAuto: {
      ...meta,
      progressPct,
      step: pickNumber(auto, ['step', 'MES.Step']),
      cycleActive: pickBoolean(auto, ['cycleActive', 'MES.CycleActive']) ?? false,
      cycleDone: pickBoolean(auto, ['cycleDone', 'cycleFinished', 'MES.CycleDone']) ?? false,
      state: pickNumber(auto, ['state', 'MES.State']) ?? (typeof auto.state === 'string' ? auto.state : undefined),
      faultType: pickNumber(auto, ['faultType', 'MES.FaultType']) ?? (typeof auto.faultType === 'string' ? auto.faultType : undefined),
      integrity: pickBoolean(auto, ['integrity', 'MES.Integrity']),
      throughput: pickNumber(auto, ['throughput', 'MES.Throughput']),
      blockRisk,
      progressHistory: normalizeValueHistory(auto.progressHistory ?? data.progressHistory, ['value', 'progress', 'progressPct']),
      throughputHistory: normalizeValueHistory(auto.throughputHistory ?? data.throughputHistory, ['value', 'throughput'])
    },
    railManual: {
      ...meta,
      fesRouteValid: pickBoolean(manual, ['fesRouteValid', 'FESRouteValid', 'MES.FESRouteValid']),
      marrakechRouteValid: pickBoolean(manual, ['marrakechRouteValid', 'MES.MarrakechRouteValid']),
      directionConflict: pickBoolean(manual, ['directionConflict', 'MES.DirectionConflict']),
      totalCycleCount: pickNumber(manual, ['totalCycleCount', 'MES.TotalCycleCount']),
      fesCycleCount: pickNumber(manual, ['fesCycleCount', 'MES.FESCycleCount']),
      marrakechCycleCount: pickNumber(manual, ['marrakechCycleCount', 'MES.MarrakechCycleCount']),
      safetyScore,
      routingScore,
      globalFault: pickBoolean(manual, ['globalFault', 'MES.GlobalFault']),
      conflictCount: pickNumber(manual, ['conflictCount', 'MES.ConflictCount']),
      throughput: pickNumber(manual, ['throughput', 'MES.Throughput']),
      loadPercent: pickPercent(manual, ['loadPercent', 'MES.LoadPercent']),
      safetyHistory: normalizeValueHistory(manual.safetyHistory ?? data.safetyHistory, ['value', 'safetyScore']),
      routingHistory: normalizeValueHistory(manual.routingHistory ?? data.routingHistory, ['value', 'routingScore']),
      conflictHistory: normalizeValueHistory(manual.conflictHistory ?? data.conflictHistory, ['value', 'conflictCount'])
    },
    progress: progressPct,
    ratio: Number((progressPct / 100).toFixed(2)),
    blockRisk,
    completedSteps,
    step1: completedSteps >= 1,
    step2: completedSteps >= 2,
    step3: completedSteps >= 3,
    step4: completedSteps >= 4,
    score: safetyScore ?? routingScore ?? undefined
  };
};

const normalizePowerGrid = (payload: unknown, isFallback: boolean): PowerGridSummary => {
  const data = getDataRecord(payload);
  const meta = metadataFrom(data, isFallback);
  const sourceMix = asRecord(data.sourceMix) ?? {};
  const generation = asRecord(data.generation) ?? {};
  const demand = asRecord(data.demandByClient) ?? {};

  const totalProduction = pickNumber(data, ['totalProduction', 'tap', 'MES.TotalProduction']);
  const totalConsumption = pickNumber(data, ['totalConsumption', 'tcp', 'MES.TotalConsumption']);
  const delta = pickNumber(data, ['delta']) ?? (totalProduction !== undefined && totalConsumption !== undefined
    ? Number((totalProduction - totalConsumption).toFixed(2))
    : undefined);

  const normalizedSourceMix = {
    pe: pickPercent(sourceMix, ['pe', 'PE', 'windPct']),
    fs: pickPercent(sourceMix, ['fs', 'FS', 'solarPct']),
    gs: pickPercent(sourceMix, ['gs', 'GS', 'gasPct']),
    windPct: pickPercent(sourceMix, ['windPct', 'pe', 'PE']),
    solarPct: pickPercent(sourceMix, ['solarPct', 'fs', 'FS']),
    gasPct: pickPercent(sourceMix, ['gasPct', 'gs', 'GS'])
  };

  return {
    ...meta,
    tap: pickNumber(data, ['tap', 'totalProduction', 'MES.TotalProduction']),
    tcp: pickNumber(data, ['tcp', 'totalConsumption', 'MES.TotalConsumption']),
    delta,
    balanceStatus: typeof data.balanceStatus === 'string'
      ? data.balanceStatus
      : delta !== undefined
        ? delta < 0
          ? 'deficit'
          : Math.abs(delta) < 0.01
            ? 'balanced'
            : 'surplus'
        : undefined,
    totalProduction,
    totalConsumption,
    reserveMargin: pickNumber(data, ['reserveMargin', 'reserve', 'MES.ReserveMargin']),
    sourceMix: normalizedSourceMix,
    generation: {
      pe: pickNumber(generation, ['pe', 'PE']),
      fs: pickNumber(generation, ['fs', 'FS']),
      gs: pickNumber(generation, ['gs', 'GS'])
    },
    losses: pickNumber(data, ['losses', 'MES.Losses']),
    reserve: pickNumber(data, ['reserve', 'reserveMargin', 'MES.ReserveMargin']),
    servedStatus: (Array.isArray(data.servedStatus) ? data.servedStatus : []) as Array<Record<string, unknown>>,
    anomalySummary: (Array.isArray(data.anomalySummary) ? data.anomalySummary : []) as Array<Record<string, unknown>>,
    sources: asRecord(data.sources) as PowerGridSummary['sources'],
    sourceStates: asRecord(data.sourceStates) as PowerGridSummary['sourceStates'],
    activeSources: pickNumber(data, ['activeSources']),
    demandByClient: {
      factory: pickNumber(demand, ['factory', 'factoryDemand']) ?? pickNumber(data, ['factoryDemand', 'MES.FactoryDemand']),
      homes: pickNumber(demand, ['homes', 'homesDemand']) ?? pickNumber(data, ['homesDemand', 'MES.HomesDemand']),
      railway: pickNumber(demand, ['railway', 'railwayDemand']) ?? pickNumber(data, ['railwayDemand', 'MES.RailwayDemand'])
    },
    balanceHistory: normalizeBalanceHistory(data.balanceHistory),
    reserveHistory: normalizeValueHistory(data.reserveHistory, ['value', 'reserve', 'reserveMargin']),
    lossesHistory: normalizeValueHistory(data.lossesHistory, ['value', 'losses']),
    sourceMixHistory: normalizeSourceMixHistory(data.sourceMixHistory),
    demandHistory: normalizeDemandHistory(data.demandHistory)
  };
};

const normalizeOverview = (payload: unknown, isFallback: boolean): OverviewPayload => {
  const data = getDataRecord(payload);
  const meta = metadataFrom(data, isFallback);
  const scores = asRecord(data.scores) ?? {};
  const alerts = asRecord(data.alerts) ?? {};
  const factory = asRecord(data.factory) ?? {};
  const powergrid = asRecord(data.powergrid) ?? {};
  const railauto = asRecord(data.railauto) ?? {};
  const railmanual = asRecord(data.railmanual) ?? {};
  const pipeline = asRecord(data.pipeline) ?? {};

  return {
    ...meta,
    globalMesScore: pickPercent(data, ['globalMesScore']) ?? pickPercent(scores, ['global']),
    factoryOee: pickPercent(data, ['factoryOee']) ?? pickPercent(factory, ['oee', 'efficiencyScore']),
    powerReserve: pickNumber(data, ['powerReserve']) ?? pickNumber(powergrid, ['reserveMargin', 'reserve']),
    railSafety: pickPercent(data, ['railSafety']) ?? pickPercent(railmanual, ['safetyScore']) ?? pickPercent(railauto, ['safetyScore']),
    activeAlerts: pickNumber(data, ['activeAlerts']) ?? pickNumber(alerts, ['count', 'alertCount']),
    recommendedActions: Array.isArray(data.recommendedActions)
      ? data.recommendedActions.filter((item): item is string => typeof item === 'string')
      : [],
    pipelineStatus: typeof data.pipelineStatus === 'string'
      ? data.pipelineStatus
      : typeof pipeline.status === 'string'
        ? pipeline.status
        : undefined,
    status: typeof data.status === 'string' ? data.status : undefined,
    powergrid: {
      ...powergrid,
      reserveMargin: pickNumber(powergrid, ['reserveMargin', 'reserve']),
      losses: pickNumber(powergrid, ['losses'])
    },
    factory,
    railauto,
    railmanual,
    scores: {
      energy: pickPercent(scores, ['energy']),
      factory: pickPercent(scores, ['factory']),
      rail: pickPercent(scores, ['rail']),
      global: pickPercent(scores, ['global'])
    },
    alerts: {
      deficit: pickNumber(alerts, ['deficit']) ?? undefined,
      factoryBlocked: pickNumber(alerts, ['factoryBlocked']) ?? undefined,
      railBlocked: pickNumber(alerts, ['railBlocked']) ?? undefined
    },
    pipeline: {
      ...pipeline,
      stale: toBoolean(pipeline.stale)
    }
  };
};

const normalizeAlerts = (payload: unknown, isFallback: boolean): AlertsPayload => {
  const data = getDataRecord(payload);
  const meta = metadataFrom(data, isFallback);
  const active = Array.isArray(data.active) ? data.active : [];
  const recent = Array.isArray(data.recent) ? data.recent : [];
  const alerts = Array.isArray(data.alerts) ? data.alerts : [];

  return {
    ...meta,
    active: active as AlertsPayload['active'],
    recent: recent as AlertsPayload['recent'],
    alerts: alerts as AlertsPayload['alerts'],
    count: pickNumber(data, ['count']),
    alertCount: pickNumber(data, ['alertCount', 'count'])
  };
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
  postProcess: (payload: T, isFallback: boolean) => T
): Promise<T> => {
  const mode = getDataSourceMode();
  if (mode === 'mock') {
    const payload = fallback();
    fallbackContext.wasFallback = true;
    fallbackContext.reason = 'Mock mode enabled by user';
    return postProcess(payload, true);
  }

  if (!API_ENABLED_BY_ENV) {
    const payload = fallback();
    fallbackContext.wasFallback = true;
    fallbackContext.reason = 'API disabled by environment (VITE_DISABLE_API=1)';
    return postProcess(payload, true);
  }

  try {
    const payload = await fetchJsonWithTimeout<T>(path);
    fallbackContext.wasFallback = false;
    fallbackContext.reason = undefined;
    return postProcess(payload, false);
  } catch (error) {
    console.warn(`[DataProtect MES] API ${path} unavailable, fallback to mocks.`, error);
    const payload = fallback();
    fallbackContext.wasFallback = true;
    fallbackContext.reason = error instanceof Error ? error.message : 'API unreachable';
    return postProcess(payload, true);
  }
};

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

export const getOverview = async (): Promise<OverviewPayload> => {
  await wait();
  return withFallback('/api/overview', () => clone(overviewMock), (payload, isFallback) =>
    normalizeOverview(payload, isFallback)
  );
};

export const getPowerGridSummary = async (): Promise<PowerGridSummary> => {
  await wait();
  return withFallback('/api/powergrid/overview', () => clone(powerGridMock), (payload, isFallback) =>
    normalizePowerGrid(payload, isFallback)
  );
};

export const getFactorySummary = async (): Promise<FactorySummary> => {
  await wait();
  return withFallback('/api/factory/dashboard', () => clone(factoryMock), (payload, isFallback) =>
    normalizeFactory(payload, isFallback)
  );
};

export const getRailSummary = async (): Promise<RailSummary> => {
  await wait();
  return withFallback('/api/rail/dashboard', () => clone(railAutoMock), (payload, isFallback) =>
    normalizeRail(payload, isFallback)
  );
};

export const getAlerts = async (): Promise<AlertsPayload> => {
  await wait(180);
  return withFallback('/api/alerts', () => clone(alertsMock), (payload, isFallback) =>
    normalizeAlerts(payload, isFallback)
  );
};
