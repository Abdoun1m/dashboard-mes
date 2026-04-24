import type { FactorySummary } from '../types/mes';

export const factoryMock: FactorySummary = {
  installationActive: 9,
  plantOperational: 1,
  cycleActive: 14,
  cycleFinished: 236,
  recyclingActive: 1,
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
  efficiencyScore: 88
};
