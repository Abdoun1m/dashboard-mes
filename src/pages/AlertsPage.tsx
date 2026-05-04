import { useMemo, useState } from 'react';
import { Badge } from '../components/ui/badge';
import { AlertList } from '../components/alerts/AlertList';
import { useLiveData } from '../hooks/useLiveData';
import { getAlerts } from '../services/mesService';
import type { AlertItem } from '../types/mes';

const severities: Array<AlertItem['severity'] | 'all'> = ['all', 'critical', 'high', 'medium', 'low', 'info'];
const severityLabel: Record<AlertItem['severity'] | 'all', string> = {
  all: 'toutes',
  critical: 'critique',
  high: 'élevée',
  medium: 'moyenne',
  low: 'faible',
  info: 'info'
};

export const AlertsPage = () => {
  const { data, loading, error, isFallback } = useLiveData(getAlerts, 7000);
  const [severityFilter, setSeverityFilter] = useState<AlertItem['severity'] | 'all'>('all');

  const alerts = useMemo(() => {
    if (!data) return [];
    if (severityFilter === 'all') return data.alerts;
    return data.alerts.filter((item) => item.severity === severityFilter);
  }, [data, severityFilter]);

  if (loading && !data) {
    return <div className="glass-card text-sm text-zinc-500 dark:text-zinc-400">Chargement du flux d'alertes...</div>;
  }

  if (error && !data) {
    return <div className="glass-card text-sm text-zinc-500 dark:text-zinc-400">Service d'alertes indisponible. Nouvelle tentative automatique...</div>;
  }

  return (
    <div className="space-y-5">
      {isFallback && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
          <Badge variant="warning" className="mb-2">Données estimées</Badge>
          <p className="text-xs text-amber-700 dark:text-amber-400">Les données affichées proviennent du fallback - l'API en temps réel est actuellement indisponible.</p>
        </div>
      )}

      <section className="glass-card">
        <p className="subtle-label">Filtres visuels</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {severities.map((severity) => (
            <button
              key={severity}
              onClick={() => setSeverityFilter(severity)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                severityFilter === severity
                  ? 'border-brand-600 bg-brand-600 text-white'
                  : 'border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800'
              }`}
            >
              {severityLabel[severity]}
            </button>
          ))}
        </div>
      </section>

      <AlertList alerts={alerts} />
    </div>
  );
};
