import type { OverviewPayload } from '../types/mes';

const now = Date.now();
const t = (offsetMin: number) => new Date(now - offsetMin * 60_000).toISOString();

export const overviewMock: OverviewPayload = {
  globalMesScore: 88.6,
  factoryOee: 82.4,
  powerReserve: 189.8,
  railSafety: 93.5,
  activeAlerts: 3,
  recommendedActions: [
    'Maintain reserve margin above 15%.',
    'Track factory performance drift during shift changes.',
    'Review rail conflict root cause from last cycle.'
  ],
  pipelineStatus: 'healthy',
  status: 'Operational with minor constraints',
  powergrid: {
    tap: 654.5,
    tcp: 464.7,
    delta: 189.8,
    totalProduction: 654.5,
    totalConsumption: 464.7,
    reserveMargin: 189.8,
    losses: 24.7
  },
  factory: {
    installationActive: true,
    plantOperational: true,
    cycleActive: true,
    cycleFinished: true,
    totalCycles: 439,
    oee: 82.4,
    qualityPercent: 96.2,
    availabilityPercent: 91.5,
    performancePercent: 93.1
  },
  railauto: {
    completedSteps: 3,
    progressPct: 77,
    progress: 77,
    step: 3,
    cycleActive: true,
    cycleDone: false,
    safetyScore: 93.5,
    routingScore: 89.7,
    faultType: 0,
    state: 1
  },
  railmanual: {
    fesRouteValid: true,
    marrakechRouteValid: true,
    directionConflict: false,
    totalCycleCount: 42,
    fesCycleCount: 20,
    marrakechCycleCount: 22,
    safetyScore: 93.5,
    routingScore: 89.7
  },
  scores: {
    energy: 90.1,
    factory: 82.4,
    rail: 91.6,
    global: 88.6
  },
  alerts: {
    deficit: 1,
    factoryBlocked: 1,
    railBlocked: 1
  },
  pipeline: {
    status: 'healthy',
    heartbeat: 12438,
    stale: false
  },
  generatedAt: t(0),
  sourceUpdatedAt: t(0),
  source: 'mock',
  fallback: true,
  pointCount: 128
};
