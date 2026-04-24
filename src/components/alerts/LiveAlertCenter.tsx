import { BellRing } from 'lucide-react';
import type { AlertItem } from '../../types/mes';

interface LiveAlertCenterProps {
  alerts: AlertItem[];
  lastUpdated: Date | null;
}

export const LiveAlertCenter = ({ alerts, lastUpdated }: LiveAlertCenterProps) => (
  <article className="glass-card">
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="subtle-label">Centre d'alertes en direct</p>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {lastUpdated ? `Mis à jour à ${lastUpdated.toLocaleTimeString('fr-FR')}` : 'Initialisation du flux...'}
        </p>
      </div>
      <BellRing className="text-brand-600 dark:text-brand-400" />
    </div>

    <div className="mt-4 space-y-2">
      {alerts.slice(0, 3).map((alert) => (
        <div key={alert.code} className="rounded-xl bg-zinc-100 px-3 py-2 text-sm text-zinc-700 dark:bg-zinc-800/70 dark:text-zinc-200">
          <span className="mr-2 font-medium">{alert.code}</span>
          {alert.message}
        </div>
      ))}
      {alerts.length === 0 ? (
        <div className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-200">
          Aucune alerte critique active.
        </div>
      ) : null}
    </div>
  </article>
);
