import type { PowerGridSummary } from '../types/mes';

export const powerGridMock: PowerGridSummary = {
  tap: 846.2,
  tcp: 802.4,
  delta: 43.8,
  totalProduction: 1289.4,
  sourceMix: {
    windPct: 42,
    solarPct: 33,
    gasPct: 25
  },
  sources: {
    wind: 541.5,
    solar: 425.6,
    gas: 322.3
  },
  sourceStates: {
    wind: 1,
    solar: 1,
    gas: 1
  },
  activeSources: 3
};
