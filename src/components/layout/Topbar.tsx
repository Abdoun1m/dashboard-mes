import { Menu, Moon, Sun } from 'lucide-react';
import { useMesQuery } from '../../hooks/useMesQuery';
import { StatusPill } from '../kpi/StatusPill';
import { formatAge } from '../../utils/format';

interface TopbarProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  pageTitle: string;
}

export const Topbar = ({ theme, onToggleTheme }: TopbarProps) => {
  const health = useMesQuery<Record<string, unknown>>(['mes', 'health'], '/api/mes/health');
  const freshness = useMesQuery<Record<string, unknown>>(['mes', 'freshness'], '/api/mes/freshness');

  const statusLabel = (health.data?.status as string) || 'Unknown';
  const heartbeat = (health.data?.heartbeat as string | number | undefined) ?? '—';
  const apiStatus = health.meta?.ok ? 'Online' : 'Degraded';
  const lastUpdated = formatAge(health.lastUpdated ?? freshness.lastUpdated ?? null);

  return (
    <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border border-zinc-200 bg-white px-4 py-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          className="rounded-md border border-zinc-200 p-2 text-zinc-600 dark:border-zinc-700 dark:text-zinc-300 lg:hidden"
          aria-label="menu"
        >
          <Menu size={18} />
        </button>
        {theme === 'light' ? (
          <img src="/dataprotect_mes_logo.png" alt="DataProtect MES" className="hidden h-7 w-20 rounded-md object-contain sm:block" />
        ) : (
          <img
            src="/dataprotect_mes_logo_dark.png"
            alt="DataProtect MES"
            className="hidden h-7 w-20 rounded-md object-contain sm:block"
          />
        )}
        <div>
          <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">DataProtect MES</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Operational cyber-physical console</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-600 dark:text-zinc-300">
        <StatusPill label="MES status" value={statusLabel} tone={health.meta?.ok ? 'ok' : 'warning'} />
        <StatusPill label="Freshness" value={freshness.freshness} tone={freshness.freshness === 'fresh' ? 'ok' : 'warning'} />
        <StatusPill label="Heartbeat" value={String(heartbeat)} tone="info" />
        <StatusPill label="API" value={apiStatus} tone={health.meta?.ok ? 'ok' : 'warning'} />
        <StatusPill label="Last update" value={lastUpdated} tone="muted" />
        <button
          onClick={onToggleTheme}
          className="inline-flex items-center gap-2 rounded-md border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
          {theme === 'light' ? 'Dark' : 'Light'}
        </button>
      </div>
    </header>
  );
};
