export const pct = (value: number, digits = 0): string => `${value.toFixed(digits)}%`;

export const num = (value: number, digits = 1): string =>
  new Intl.NumberFormat('fr-FR', { maximumFractionDigits: digits }).format(value);

export const formatKw = (value: number, unit = 'MW'): string => `${num(value)} ${unit}`;

export const formatPct = (value: number, digits = 1): string => `${num(value, digits)}%`;

export const scoreLevel = (score: number): 'Excellent' | 'Stable' | 'Surveillance' | 'Risque' => {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Stable';
  if (score >= 60) return 'Surveillance';
  return 'Risque';
};

export const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

export type StatusTone = 'ok' | 'warning' | 'critical' | 'info' | 'muted';

export const classifyStatus = (value: number | null | undefined, warning = 70, critical = 50): StatusTone => {
  if (value === null || value === undefined || Number.isNaN(value)) return 'muted';
  if (value < critical) return 'critical';
  if (value < warning) return 'warning';
  return 'ok';
};

export type FreshnessState = 'fresh' | 'stale' | 'degraded';

export const getFreshnessStatus = (lastUpdated: number | null, staleAfterMs = 12000): FreshnessState => {
  if (!lastUpdated) return 'degraded';
  const age = Date.now() - lastUpdated;
  if (age > staleAfterMs * 2) return 'degraded';
  if (age > staleAfterMs) return 'stale';
  return 'fresh';
};

export const formatAge = (lastUpdated: number | null): string => {
  if (!lastUpdated) return '—';
  const seconds = Math.max(0, Math.floor((Date.now() - lastUpdated) / 1000));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m`;
};

export const safeNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const parsed = typeof value === 'string' ? Number(value) : NaN;
  return Number.isFinite(parsed) ? parsed : null;
};
