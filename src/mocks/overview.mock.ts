import type { OverviewPayload } from '../types/mes';

export const overviewMock: OverviewPayload = {
  powergrid: {
    tap: 846.2,
    tcp: 802.4,
    delta: 43.8,
    totalProduction: 1289.4
  },
  factory: {
    installationActive: 1,
    plantOperational: 1,
    cycleActive: 1,
    cycleFinished: 1,
    totalCycles: 236
  },
  railauto: {
    completedSteps: 3,
    progressPct: 77,
    progress: 77
  },
  scores: {
    energy: 91,
    factory: 84,
    rail: 79,
    global: 86
  },
  alerts: {
    deficit: 1,
    factoryBlocked: 0,
    railBlocked: 1
  },
  status: 'Opérationnel avec contraintes mineures',
  generatedAt: new Date().toISOString(),
  sourceUpdatedAt: new Date().toISOString(),
  pointCount: 128
};
