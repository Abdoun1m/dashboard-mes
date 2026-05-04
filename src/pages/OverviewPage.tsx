import { Activity, Gauge, ShieldAlert, Zap } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { AlertList } from '../components/alerts/AlertList';
import { LiveAlertCenter } from '../components/alerts/LiveAlertCenter';
import { MetricCard } from '../components/cards/MetricCard';
import { ScoreCard } from '../components/cards/ScoreCard';
import { useLiveData } from '../hooks/useLiveData';
import { getAlerts, getOverview } from '../services/mesService';
import { num } from '../utils/format';

export const OverviewPage = () => {
  const overview = useLiveData(getOverview, 7000);
  const alerts = useLiveData(getAlerts, 8000);
  const data = overview.data;
  const alertsData = alerts.data;

  if ((overview.loading || alerts.loading) && (!data || !alertsData)) {
    return <div className="glass-card text-sm text-zinc-500 dark:text-zinc-400">Chargement de la vue exécutive...</div>;
  }

  if ((overview.error || alerts.error) && (!data || !alertsData)) {
    return (
      <div className="glass-card text-sm text-zinc-500 dark:text-zinc-400">
        Flux de données temporairement indisponible. Nouvelle tentative avec fallback...
      </div>
    );
  }
  if (!data || !alertsData) return null;

  return (
    <div className="space-y-6">
      {overview.isFallback && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
          <Badge variant="warning" className="mb-2">Données estimées</Badge>
          <p className="text-xs text-amber-700 dark:text-amber-400">Les données affichées proviennent du fallback - l'API en temps réel est actuellement indisponible.</p>
        </div>
      )}
      
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    <MetricCard label="Statut global" value={data.status} icon={ShieldAlert} tone="brand" hint="Liaison OT/DMZ/IT" />
    <MetricCard label="Activité globale" value={`${data.factory.cycleActive} cycles actifs`} icon={Activity} tone="neutral" hint="Flux synthétique temps réel" />
    <MetricCard label="Alertes critiques" value={`${alertsData.count}`} icon={ShieldAlert} tone="danger" hint="Centre d'alertes live" />
    <MetricCard label="Delta énergie" value={`${num(data.powergrid.delta)} MW`} icon={Zap} tone="success" hint="Production - Consommation" />
      </section>

      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        <ScoreCard title="Score global" score={data.scores.global} />
        <ScoreCard title="Score énergie" score={data.scores.energy} />
        <ScoreCard title="Score usine" score={data.scores.factory} />
        <ScoreCard title="Score rail" score={data.scores.rail} />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <div className="glass-card xl:col-span-1">
          <p className="subtle-label">État système</p>
          <div className="mt-4 space-y-3 text-sm text-zinc-700 dark:text-zinc-300">
            <p className="flex items-center justify-between rounded-xl bg-zinc-100 px-3 py-2 dark:bg-zinc-800/70">
              <span>Production totale réseau</span>
              <span className="font-semibold">{num(data.powergrid.totalProduction)} MW</span>
            </p>
            <p className="flex items-center justify-between rounded-xl bg-zinc-100 px-3 py-2 dark:bg-zinc-800/70">
              <span>Installations usine actives</span>
              <span className="font-semibold">{data.factory.installationActive}</span>
            </p>
            <p className="flex items-center justify-between rounded-xl bg-zinc-100 px-3 py-2 dark:bg-zinc-800/70">
              <span>Progression rail</span>
              <span className="font-semibold">{data.railauto.progressPct}%</span>
            </p>
            <p className="flex items-center justify-between rounded-xl bg-zinc-100 px-3 py-2 dark:bg-zinc-800/70">
              <span>Score global</span>
              <span className="inline-flex items-center gap-1 font-semibold text-brand-700 dark:text-brand-300">
                <Gauge size={14} /> {data.scores.global}
              </span>
            </p>
          </div>
        </div>

        <div className="xl:col-span-2">
          <LiveAlertCenter alerts={alertsData.alerts} lastUpdated={alerts.lastUpdated} />
        </div>
      </section>

      <AlertList alerts={alertsData.alerts} />
    </div>
  );
};
