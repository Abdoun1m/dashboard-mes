export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

// API metadata shared across all summary endpoints
export interface ApiMetadata {
  generatedAt?: string;
  sourceUpdatedAt?: string;
  source?: string;
  fallback?: boolean;
  pointCount?: number;
}

export interface HistoryValuePoint {
  timestamp: string;
  value: number;
}

export interface HistoryQapPoint {
  timestamp: string;
  quality: number;
  availability: number;
  performance: number;
}

export interface HistoryThroughputPoint {
  timestamp: string;
  perMin: number;
  perHour: number;
}

export interface HistoryUptimePoint {
  timestamp: string;
  uptimeSeconds: number;
  downtimeSeconds: number;
}

export interface HistoryBalancePoint {
  timestamp: string;
  production: number;
  consumption: number;
}

export interface HistorySourceMixPoint {
  timestamp: string;
  pe: number;
  fs: number;
  gs: number;
}

export interface HistoryDemandPoint {
  timestamp: string;
  factory: number;
  homes: number;
  railway: number;
}

export interface MesAlert {
  id?: string | number;
  code?: string;
  severity: Severity;
  message: string;
  timestamp?: string;
  area?: string;
}

export interface MesOverview {
  executiveScore?: number;
  operationalScore?: number;
  globalAvailability?: number;
  globalRisk?: number;
  status?: string;
  timelineState?: string;
  recommendedActions?: string[];
  systemMap?: Record<string, unknown>;
}

export interface PowerGridSnapshot {
  tap?: number;
  tcp?: number;
  delta?: number;
  balanceStatus?: string;
  production?: number;
  consumption?: number;
  losses?: number;
  reserve?: number;
  energyScore?: number;
  blackoutRisk?: number;
  anomalySummary?: Array<Record<string, unknown>>;
  sourceMix?: Record<string, number>;
  generation?: { pe?: number; fs?: number; gs?: number };
  servedStatus?: Array<Record<string, unknown>>;
}

export interface FactorySnapshot {
  stateTimeline?: Array<Record<string, unknown>>;
  cycleTimeline?: Array<Record<string, unknown>>;
  tankShadow?: Array<Record<string, unknown>>;
  bottlingReadiness?: number;
  processScore?: number;
  operationalRisk?: number;
  availability?: number;
  recycleStatus?: Record<string, unknown>;
  alarms?: MesAlert[];
}

export interface RailSnapshot {
  autoProgress?: Array<Record<string, unknown>>;
  manualRoutes?: Array<Record<string, unknown>>;
  routeConflicts?: Array<Record<string, unknown>>;
  throughput?: Array<Record<string, unknown>>;
  safetyScore?: number;
  routingScore?: number;
  globalFault?: boolean | string | number;
  completion?: Record<string, number>;
}

export interface PipelineSnapshot {
  stages?: Array<Record<string, unknown>>;
  freshness?: Array<Record<string, unknown>>;
  quality?: Array<Record<string, unknown>>;
  heartbeat?: string | number;
}

export interface RawTelemetryRow {
  key: string;
  value: string | number | boolean | null;
  timestamp?: string;
}

// Summary endpoint types (primary data sources for dashboard pages)

export interface FactoryTanks {
  tank1Low?: number;
  tank1High?: number;
  tank2Low?: number;
  tank2High?: number;
}

export interface FactoryTankSummary {
  fullCount?: number;
  lowCount?: number;
}

export interface FactorySummary extends ApiMetadata {
  installationActive?: number | boolean;
  plantOperational?: number | boolean;
  cycleActive?: number | boolean;
  cycleFinished?: number | boolean;
  totalCycles?: number;
  cycleCount?: number;
  recyclingActive?: number | boolean;
  oee?: number;
  qualityPercent?: number;
  availabilityPercent?: number;
  performancePercent?: number;
  totalGood?: number;
  totalReject?: number;
  throughputPerMin?: number;
  throughputPerHour?: number;
  loadPercent?: number;
  uptimeSeconds?: number;
  downtimeSeconds?: number;
  processState?: number;
  targetCycleTime?: number;
  actualCycleTime?: number;
  efficiencyScore?: number;
  tanks?: FactoryTanks;
  tankSummary?: FactoryTankSummary;
  oeeHistory?: HistoryValuePoint[];
  qapHistory?: HistoryQapPoint[];
  throughputHistory?: HistoryThroughputPoint[];
  cycleHistory?: HistoryValuePoint[];
  uptimeHistory?: HistoryUptimePoint[];
}

export interface RailAutoSummary extends ApiMetadata {
  progressPct?: number;
  step?: number;
  cycleActive?: number | boolean;
  cycleDone?: number | boolean;
  state?: number | string;
  faultType?: number | string;
  integrity?: number | boolean;
  throughput?: number;
  blockRisk?: number;
  progressHistory?: HistoryValuePoint[];
  throughputHistory?: HistoryValuePoint[];
}

export interface RailManualSummary extends ApiMetadata {
  fesRouteValid?: number | boolean;
  marrakechRouteValid?: number | boolean;
  directionConflict?: number | boolean;
  totalCycleCount?: number;
  fesCycleCount?: number;
  marrakechCycleCount?: number;
  safetyScore?: number;
  routingScore?: number;
  globalFault?: number | boolean;
  conflictCount?: number;
  throughput?: number;
  loadPercent?: number;
  safetyHistory?: HistoryValuePoint[];
  routingHistory?: HistoryValuePoint[];
  conflictHistory?: HistoryValuePoint[];
}

export interface RailSummary extends ApiMetadata {
  railAuto?: RailAutoSummary;
  railManual?: RailManualSummary;
  progress?: number;
  ratio?: number;
  blockRisk?: number;
  completedSteps?: number;
  step1?: number | boolean;
  step2?: number | boolean;
  step3?: number | boolean;
  step4?: number | boolean;
  score?: number;
}

export interface PowerGridSourceMix {
  PE?: number;
  FS?: number;
  GS?: number;
  pe?: number;
  fs?: number;
  gs?: number;
  windPct?: number;
  solarPct?: number;
  gasPct?: number;
  [key: string]: number | undefined;
}

export interface PowerGridGeneration {
  PE?: number;
  FS?: number;
  GS?: number;
  pe?: number;
  fs?: number;
  gs?: number;
  [key: string]: number | undefined;
}

export interface PowerGridSources {
  PE?: number;
  FS?: number;
  GS?: number;
  pe?: number;
  fs?: number;
  gs?: number;
  wind?: number;
  solar?: number;
  gas?: number;
  [key: string]: number | undefined;
}

export interface PowerGridSummary extends ApiMetadata {
  tap?: number;
  tcp?: number;
  delta?: number;
  balanceStatus?: string;
  totalProduction?: number;
  totalConsumption?: number;
  reserveMargin?: number;
  sourceMix?: PowerGridSourceMix;
  generation?: PowerGridGeneration;
  losses?: number;
  reserve?: number;
  servedStatus?: Array<Record<string, unknown>>;
  anomalySummary?: Array<Record<string, unknown>>;
  sources?: PowerGridSources;
  sourceStates?: PowerGridSources;
  activeSources?: number;
  demandByClient?: {
    factory?: number;
    homes?: number;
    railway?: number;
  };
  balanceHistory?: HistoryBalancePoint[];
  reserveHistory?: HistoryValuePoint[];
  lossesHistory?: HistoryValuePoint[];
  sourceMixHistory?: HistorySourceMixPoint[];
  demandHistory?: HistoryDemandPoint[];
}

export interface OverviewPayload extends ApiMetadata {
  globalMesScore?: number;
  factoryOee?: number;
  powerReserve?: number;
  railSafety?: number;
  activeAlerts?: number;
  recommendedActions?: string[];
  pipelineStatus?: string;
  status?: string;
  powergrid?: {
    tap?: number;
    tcp?: number;
    delta?: number;
    totalProduction?: number;
    totalConsumption?: number;
    reserveMargin?: number;
    losses?: number;
    [key: string]: unknown;
  };
  factory?: {
    installationActive?: number | boolean;
    plantOperational?: number | boolean;
    cycleActive?: number | boolean;
    cycleFinished?: number | boolean;
    totalCycles?: number;
    cycleCount?: number;
    oee?: number;
    qualityPercent?: number;
    availabilityPercent?: number;
    performancePercent?: number;
    [key: string]: unknown;
  };
  railauto?: {
    completedSteps?: number;
    progressPct?: number;
    progress?: number;
    state?: number | string;
    faultType?: number | string;
    safetyScore?: number;
    routingScore?: number;
    step?: number;
    cycleActive?: number | boolean;
    cycleDone?: number | boolean;
    [key: string]: unknown;
  };
  railmanual?: {
    fesRouteValid?: number | boolean;
    marrakechRouteValid?: number | boolean;
    directionConflict?: number | boolean;
    totalCycleCount?: number;
    fesCycleCount?: number;
    marrakechCycleCount?: number;
    safetyScore?: number;
    routingScore?: number;
    [key: string]: unknown;
  };
  scores?: {
    energy?: number;
    factory?: number;
    rail?: number;
    global?: number;
  };
  alerts?: {
    deficit?: number;
    factoryBlocked?: number;
    railBlocked?: number;
  };
  pipeline?: {
    status?: string;
    heartbeat?: number;
    stale?: boolean;
    [key: string]: unknown;
  };
}

export interface AlertsPayload extends ApiMetadata {
  active?: MesAlert[];
  recent?: MesAlert[];
  alerts?: MesAlert[];
  count?: number;
  alertCount?: number;
}

export type AlertItem = MesAlert;
