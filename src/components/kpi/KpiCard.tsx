import { StatusPill } from './StatusPill';
import type { StatusTone } from '../../utils/format';

interface KpiCardProps {
  label: string;
  value: string;
  unit?: string;
  trend?: string;
  freshness?: string;
  tone?: StatusTone;
  helper?: string;
  status?: string;
  isFallback?: boolean;
}

export const KpiCard = ({
  label,
  value,
  unit,
  trend,
  freshness,
  tone = 'muted',
  helper,
  status,
  isFallback
}: KpiCardProps) => (
  <div className="panel flex flex-col gap-3">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="panel-title">{label}</p>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{value}</span>
          {unit ? <span className="text-xs text-zinc-500 dark:text-zinc-400">{unit}</span> : null}
        </div>
      </div>
      {status ? <StatusPill label="status" value={status} tone={tone} /> : null}
    </div>
    <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
      <span>trend {trend ?? '—'}</span>
      <span>fresh {freshness ?? '—'}</span>
      {isFallback ? <span className="text-amber-500">fallback</span> : null}
    </div>
    {helper ? <p className="text-xs text-zinc-500 dark:text-zinc-400">{helper}</p> : null}
  </div>
);
