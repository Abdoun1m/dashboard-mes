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

export interface FactorySummary {
  installationActive?: number | boolean;
  plantOperational?: number | boolean;
  cycleActive?: number;
  cycleFinished?: number;
  recyclingActive?: number | boolean;
  efficiencyScore?: number;
  tanks?: {
    tank1Low?: number;
    tank1High?: number;
    tank2Low?: number;
    tank2High?: number;
  };
  tankSummary?: {
    fullCount?: number;
    lowCount?: number;
  };
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
  generatedAt?: string;
  sourceUpdatedAt?: string;
  pointCount?: number;
}

export interface PowerGridSummary {
  tap?: number;
  tcp?: number;
  delta?: number;
  balanceStatus?: string;
  totalProduction?: number;
  totalConsumption?: number;
  sourceMix?: Record<string, number>;
  generation?: { pe?: number; fs?: number; gs?: number };
  losses?: number;
  reserve?: number;
  servedStatus?: Array<Record<string, unknown>>;
  anomalySummary?: Array<Record<string, unknown>>;
  generatedAt?: string;
  sourceUpdatedAt?: string;
  pointCount?: number;
}

export interface OverviewPayload {
  powergrid?: Record<string, unknown>;
  factory?: Record<string, unknown>;
  railauto?: Record<string, unknown>;
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
  generatedAt?: string;
  sourceUpdatedAt?: string;
  pointCount?: number;
}

export type AlertItem = MesAlert;
