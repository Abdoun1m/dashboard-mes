import type { RailSummary } from '../types/mes';

export const railAutoMock: RailSummary = {
  step1: 1,
  step2: 1,
  step3: 1,
  step4: 0,
  completedSteps: 3,
  progress: 77,
  ratio: 0.91,
  blockRisk: 21,
  score: 79,
  generatedAt: new Date().toISOString(),
  sourceUpdatedAt: new Date().toISOString(),
  pointCount: 28
};
