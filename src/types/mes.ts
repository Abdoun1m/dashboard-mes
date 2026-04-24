export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export interface OverviewPayload {
  powergrid: { tap: number; tcp: number; delta: number; totalProduction: number };
  factory: { installationActive: number; cycleActive: number; cycleFinished: number };
  railauto: { completedSteps: number; progressPct: number };
  scores: { energy: number; factory: number; rail: number; global: number };
  alerts: { deficit: number; factoryBlocked: number; railBlocked: number };
  status: string;
}

export interface PowerGridSummary {
  tap: number;
  tcp: number;
  delta: number;
  totalProduction: number;
  sourceMix: { windPct: number; solarPct: number; gasPct: number };
  sources: { wind: number; solar: number; gas: number };
  sourceStates: { wind: number; solar: number; gas: number };
  activeSources: number;
}

export interface FactorySummary {
  installationActive: number;
  plantOperational: number;
  cycleActive: number;
  cycleFinished: number;
  recyclingActive: number;
  tanks: {
    tank1Low: number;
    tank1High: number;
    tank2Low: number;
    tank2High: number;
  };
  tankSummary: { fullCount: number; lowCount: number };
  efficiencyScore: number;
}

export interface RailSummary {
  step1: number;
  step2: number;
  step3: number;
  step4: number;
  completedSteps: number;
  progress: number;
  ratio: number;
  blockRisk: number;
  score: number;
}

export interface AlertItem {
  code: string;
  severity: Severity;
  message: string;
}

export interface AlertsPayload {
  count: number;
  alerts: AlertItem[];
}
