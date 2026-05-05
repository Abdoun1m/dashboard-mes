import type { PowerGridSummary } from '../types/mes';

const now = Date.now();
const t = (offsetMin: number) => new Date(now - offsetMin * 60_000).toISOString();

export const powerGridMock: PowerGridSummary = {
  tap: 654.5,
  tcp: 464.7,
  delta: 189.8,
  totalProduction: 654.5,
  totalConsumption: 464.7,
  reserveMargin: 189.8,
  balanceStatus: 'surplus',
  sourceMix: {
    pe: 6.4,
    fs: 31.4,
    gs: 62.2,
    windPct: 6.4,
    solarPct: 31.4,
    gasPct: 62.2
  },
  sources: {
    wind: 42.1,
    solar: 205.6,
    gas: 406.8
  },
  sourceStates: {
    wind: 1,
    solar: 1,
    gas: 1
  },
  generation: {
    pe: 42.1,
    fs: 205.6,
    gs: 406.8
  },
  losses: 24.7,
  reserve: 189.8,
  demandByClient: {
    factory: 180,
    homes: 202,
    railway: 58
  },
  servedStatus: [
    { zone: 'Factory', demand: 180, served: 1 },
    { zone: 'Homes', demand: 202, served: 1 },
    { zone: 'Railway', demand: 58, served: 1 }
  ],
  activeSources: 3,
  balanceHistory: [
    { timestamp: t(24), production: 612, consumption: 455 },
    { timestamp: t(18), production: 626, consumption: 458 },
    { timestamp: t(12), production: 638, consumption: 460 },
    { timestamp: t(6), production: 647, consumption: 463 },
    { timestamp: t(0), production: 654.5, consumption: 464.7 }
  ],
  reserveHistory: [
    { timestamp: t(24), value: 157 },
    { timestamp: t(18), value: 168 },
    { timestamp: t(12), value: 178 },
    { timestamp: t(6), value: 184 },
    { timestamp: t(0), value: 189.8 }
  ],
  lossesHistory: [
    { timestamp: t(24), value: 28.4 },
    { timestamp: t(18), value: 27.5 },
    { timestamp: t(12), value: 26.3 },
    { timestamp: t(6), value: 25.4 },
    { timestamp: t(0), value: 24.7 }
  ],
  sourceMixHistory: [
    { timestamp: t(24), pe: 8.0, fs: 34.0, gs: 58.0 },
    { timestamp: t(18), pe: 7.4, fs: 33.2, gs: 59.4 },
    { timestamp: t(12), pe: 6.9, fs: 32.6, gs: 60.5 },
    { timestamp: t(6), pe: 6.7, fs: 31.9, gs: 61.4 },
    { timestamp: t(0), pe: 6.4, fs: 31.4, gs: 62.2 }
  ],
  demandHistory: [
    { timestamp: t(24), factory: 172, homes: 196, railway: 54 },
    { timestamp: t(18), factory: 175, homes: 198, railway: 55 },
    { timestamp: t(12), factory: 177, homes: 200, railway: 56 },
    { timestamp: t(6), factory: 179, homes: 201, railway: 57 },
    { timestamp: t(0), factory: 180, homes: 202, railway: 58 }
  ],
  generatedAt: t(0),
  sourceUpdatedAt: t(0),
  source: 'mock',
  fallback: true,
  pointCount: 300
};
