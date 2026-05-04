export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

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

export interface FactorySummary {
  installationActive?: number | boolean;
  plantOperational?: number | boolean;
  cycleActive?: number;
  cycleFinished?: number;
  recyclingActive?: number | boolean;
  efficiencyScore?: number;
  tanks?: FactoryTanks;
  tankSummary?: FactoryTankSummary;
  generatedAt?: string;
  sourceUpdatedAt?: string;
  pointCount?: number;
}

export interface RailSummary {
  progress?: number;
  ratio?: number;
  blockRisk?: number;
  completedSteps?: number;
  step1?: number | boolean;
  step2?: number | boolean;
  step3?: number | boolean;
  step4?: number | boolean;
  score?: number;
  generatedAt?: string;
  sourceUpdatedAt?: string;
  pointCount?: number;
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

export interface PowerGridSummary {
  tap?: number;
  tcp?: number;
  delta?: number;
  balanceStatus?: string;
  totalProduction?: number;
  totalConsumption?: number;
  sourceMix?: PowerGridSourceMix;
  generation?: PowerGridGeneration;
  losses?: number;
  reserve?: number;
  servedStatus?: Array<Record<string, unknown>>;
  anomalySummary?: Array<Record<string, unknown>>;
  sources?: PowerGridSources;
  sourceStates?: PowerGridSources;
  activeSources?: number;
  generatedAt?: string;
  sourceUpdatedAt?: string;
  pointCount?: number;
}

export interface OverviewPayload {
  powergrid?: {
    tap?: number;
    tcp?: number;
    delta?: number;
    totalProduction?: number;
    totalConsumption?: number;
    [key: string]: unknown;
  };
  factory?: {
    installationActive?: number | boolean;
    plantOperational?: number | boolean;
    cycleActive?: number;
    cycleFinished?: number;
    [key: string]: unknown;
  };
  railauto?: {
    completedSteps?: number;
    progressPct?: number;
    progress?: number;
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
  status?: string;
  generatedAt?: string;
  sourceUpdatedAt?: string;
  pointCount?: number;
}

export interface AlertsPayload {
  active?: MesAlert[];
  recent?: MesAlert[];
  alerts?: MesAlert[];
  count?: number;
  alertCount?: number;
  generatedAt?: string;
  sourceUpdatedAt?: string;
  pointCount?: number;
}

export type AlertItem = MesAlert;
