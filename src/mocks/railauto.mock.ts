import type { RailSummary } from '../types/mes';

const now = Date.now();
const t = (offsetMin: number) => new Date(now - offsetMin * 60_000).toISOString();

export const railAutoMock: RailSummary = {
  railAuto: {
    progressPct: 77,
    step: 3,
    cycleActive: true,
    cycleDone: false,
    state: 1,
    faultType: 0,
    integrity: true,
    throughput: 2.8,
    blockRisk: 18,
    progressHistory: [
      { timestamp: t(24), value: 35 },
      { timestamp: t(18), value: 48 },
      { timestamp: t(12), value: 59 },
      { timestamp: t(6), value: 68 },
      { timestamp: t(0), value: 77 }
    ],
    throughputHistory: [
      { timestamp: t(24), value: 1.9 },
      { timestamp: t(18), value: 2.2 },
      { timestamp: t(12), value: 2.4 },
      { timestamp: t(6), value: 2.6 },
      { timestamp: t(0), value: 2.8 }
    ]
  },
  railManual: {
    fesRouteValid: true,
    marrakechRouteValid: true,
    directionConflict: false,
    totalCycleCount: 42,
    fesCycleCount: 20,
    marrakechCycleCount: 22,
    safetyScore: 93.5,
    routingScore: 89.7,
    globalFault: false,
    conflictCount: 1,
    throughput: 1.6,
    loadPercent: 57.4,
    safetyHistory: [
      { timestamp: t(24), value: 90.2 },
      { timestamp: t(18), value: 91.1 },
      { timestamp: t(12), value: 92.0 },
      { timestamp: t(6), value: 93.0 },
      { timestamp: t(0), value: 93.5 }
    ],
    routingHistory: [
      { timestamp: t(24), value: 85.1 },
      { timestamp: t(18), value: 86.4 },
      { timestamp: t(12), value: 87.8 },
      { timestamp: t(6), value: 88.9 },
      { timestamp: t(0), value: 89.7 }
    ],
    conflictHistory: [
      { timestamp: t(24), value: 3 },
      { timestamp: t(18), value: 3 },
      { timestamp: t(12), value: 2 },
      { timestamp: t(6), value: 2 },
      { timestamp: t(0), value: 1 }
    ]
  },
  progress: 77,
  completedSteps: 3,
  step1: true,
  step2: true,
  step3: true,
  step4: false,
  blockRisk: 18,
  score: 93.5,
  generatedAt: t(0),
  sourceUpdatedAt: t(0),
  source: 'mock',
  fallback: true,
  pointCount: 190
};
