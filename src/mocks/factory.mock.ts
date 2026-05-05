import type { FactorySummary } from '../types/mes';

const now = Date.now();
const t = (offsetMin: number) => new Date(now - offsetMin * 60_000).toISOString();

export const factoryMock: FactorySummary = {
  installationActive: true,
  plantOperational: true,
  cycleActive: true,
  cycleFinished: true,
  totalCycles: 439,
  cycleCount: 439,
  recyclingActive: true,
  oee: 82.4,
  qualityPercent: 96.2,
  availabilityPercent: 91.5,
  performancePercent: 93.1,
  totalGood: 421,
  totalReject: 18,
  throughputPerMin: 2.6,
  throughputPerHour: 156,
  loadPercent: 73.2,
  uptimeSeconds: 12840,
  downtimeSeconds: 960,
  processState: 1,
  targetCycleTime: 23.5,
  actualCycleTime: 24.1,
  efficiencyScore: 82.4,
  tanks: {
    tank1Low: 18,
    tank1High: 82,
    tank2Low: 27,
    tank2High: 73
  },
  tankSummary: {
    fullCount: 6,
    lowCount: 2
  },
  oeeHistory: [
    { timestamp: t(24), value: 77.8 },
    { timestamp: t(18), value: 79.1 },
    { timestamp: t(12), value: 80.6 },
    { timestamp: t(6), value: 81.7 },
    { timestamp: t(0), value: 82.4 }
  ],
  qapHistory: [
    { timestamp: t(24), quality: 95.8, availability: 89.4, performance: 91.0 },
    { timestamp: t(18), quality: 96.0, availability: 89.9, performance: 91.8 },
    { timestamp: t(12), quality: 96.1, availability: 90.6, performance: 92.5 },
    { timestamp: t(6), quality: 96.2, availability: 91.0, performance: 92.9 },
    { timestamp: t(0), quality: 96.2, availability: 91.5, performance: 93.1 }
  ],
  throughputHistory: [
    { timestamp: t(24), perMin: 2.2, perHour: 132 },
    { timestamp: t(18), perMin: 2.3, perHour: 138 },
    { timestamp: t(12), perMin: 2.4, perHour: 144 },
    { timestamp: t(6), perMin: 2.5, perHour: 150 },
    { timestamp: t(0), perMin: 2.6, perHour: 156 }
  ],
  cycleHistory: [
    { timestamp: t(24), value: 412 },
    { timestamp: t(18), value: 420 },
    { timestamp: t(12), value: 427 },
    { timestamp: t(6), value: 434 },
    { timestamp: t(0), value: 439 }
  ],
  uptimeHistory: [
    { timestamp: t(24), uptimeSeconds: 10980, downtimeSeconds: 1380 },
    { timestamp: t(18), uptimeSeconds: 11460, downtimeSeconds: 1260 },
    { timestamp: t(12), uptimeSeconds: 11940, downtimeSeconds: 1140 },
    { timestamp: t(6), uptimeSeconds: 12360, downtimeSeconds: 1080 },
    { timestamp: t(0), uptimeSeconds: 12840, downtimeSeconds: 960 }
  ],
  generatedAt: t(0),
  sourceUpdatedAt: t(0),
  source: 'mock',
  fallback: true,
  pointCount: 220
};
