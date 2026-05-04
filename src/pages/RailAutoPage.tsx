import { Gauge, ShieldX } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { MetricCard } from '../components/cards/MetricCard';
import { ScoreCard } from '../components/cards/ScoreCard';
import { RailStepper } from '../components/status/RailStepper';
import { useLiveData } from '../hooks/useLiveData';
import { getRailSummary } from '../services/mesService';
import { pct } from '../utils/format';

export const RailAutoPage = () => {
  const { data, loading, error, isFallback } = useLiveData(getRailSummary, 6500);

  if (loading && !data) return <div className="glass-card text-sm text-zinc-500 dark:text-zinc-400">Chargement du process RailAuto...</div>;
  if (error && !data) {
    return <div className="glass-card text-sm text-zinc-500 dark:text-zinc-400">API RailAuto indisponible. Fallback résilient actif...</div>;
  }
  if (!data) return null;

  const started = data.completedSteps > 0;
  const finished = data.completedSteps === 4;
  const completionClass = finished ? 'Terminé' : data.progress > 65 ? 'Avancé' : 'En cours';
  const velocityScore = Math.round(Math.min(100, data.ratio * 100));
  const progressClass =
    data.progress >= 95
      ? 'w-full'
      : data.progress >= 85
        ? 'w-11/12'
        : data.progress >= 75
          ? 'w-5/6'
          : data.progress >= 65
            ? 'w-3/4'
            : data.progress >= 55
              ? 'w-2/3'
              : data.progress >= 45
                ? 'w-1/2'
                : 'w-1/3';

  const steps = [
    { key: 'Étape 1', done: data.step1 === 1 },
    { key: 'Étape 2', done: data.step2 === 1 },
    { key: 'Étape 3', done: data.step3 === 1 },
    { key: 'Étape 4', done: data.step4 === 1 }
  ];

  return (
    <div className="space-y-6">
      {isFallback && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
          <Badge variant="warning" className="mb-2">Données estimées</Badge>
          <p className="text-xs text-amber-700 dark:text-amber-400">Les données affichées proviennent du fallback - l'API en temps réel est actuellement indisponible.</p>
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Étapes terminées" value={`${data.completedSteps}/4`} tone="brand" />
        <MetricCard label="Progression" value={pct(data.progress)} />
        <MetricCard label="Ratio" value={data.ratio.toFixed(2)} />
        <MetricCard label="Risque de blocage" value={pct(data.blockRisk)} tone={data.blockRisk > 45 ? 'danger' : 'success'} icon={ShieldX} />
      </section>

      <RailStepper steps={steps} />

      <section className="glass-card">
  <p className="subtle-label">Progression premium du process</p>
        <div className="mt-4 h-4 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
          <div className={`h-full rounded-full bg-gradient-to-r from-brand-700 via-brand-500 to-brand-300 ${progressClass}`} />
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Démarré" value={started ? 'OUI' : 'NON'} />
          <MetricCard label="Terminé" value={finished ? 'OUI' : 'NON'} />
          <MetricCard label="Classe de completion" value={completionClass} />
          <MetricCard label="Score de vélocité" value={`${velocityScore}`} icon={Gauge} />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <ScoreCard title="Score rail" score={data.score} />
        <ScoreCard title="Confiance vélocité" score={velocityScore} />
      </section>
    </div>
  );
};
