import { AlertTriangle, Info, OctagonAlert } from 'lucide-react';
import type { AlertItem } from '../../types/mes';

interface AlertListProps {
  alerts: AlertItem[];
}

const severityClass: Record<AlertItem['severity'], string> = {
  critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200',
  medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200',
  low: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-200',
  info: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200'
};

const iconForSeverity = (severity: AlertItem['severity']) => {
  if (severity === 'critical') return <OctagonAlert size={16} />;
  if (severity === 'high' || severity === 'medium') return <AlertTriangle size={16} />;
  return <Info size={16} />;
};

export const AlertList = ({ alerts }: AlertListProps) => {
  if (alerts.length === 0) {
    return (
      <article className="glass-card">
        <p className="subtle-label">Alertes</p>
        <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">Aucune alerte. Système nominal.</p>
      </article>
    );
  }

  return (
    <article className="glass-card">
      <p className="subtle-label">Centre d'alertes</p>
      <div className="mt-4 space-y-3">
        {alerts.map((alert) => (
          <div
            key={`${alert.code}-${alert.message}`}
            className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/70"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium dark:bg-zinc-800">{alert.code}</span>
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${severityClass[alert.severity]}`}>
                {iconForSeverity(alert.severity)}
                {alert.severity === 'critical'
                  ? 'critique'
                  : alert.severity === 'high'
                    ? 'élevée'
                    : alert.severity === 'medium'
                      ? 'moyenne'
                      : alert.severity === 'low'
                        ? 'faible'
                        : 'info'}
              </span>
            </div>
            <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-200">{alert.message}</p>
          </div>
        ))}
      </div>
    </article>
  );
};
