export const pct = (value: number, digits = 0): string => `${value.toFixed(digits)}%`;

export const num = (value: number): string =>
  new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(value);

export const scoreLevel = (score: number): 'Excellent' | 'Stable' | 'Surveillance' | 'Risque' => {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Stable';
  if (score >= 60) return 'Surveillance';
  return 'Risque';
};

export const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));
