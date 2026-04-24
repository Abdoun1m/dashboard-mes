import { Recycle, ShieldCheck, TriangleAlert } from 'lucide-react';
import { MetricCard } from '../components/cards/MetricCard';
import { ScoreCard } from '../components/cards/ScoreCard';
import { TankLevelCard } from '../components/status/TankLevelCard';
import { useLiveData } from '../hooks/useLiveData';
import { getFactorySummary } from '../services/mesService';

export const FactoryPage = () => {
  const { data, loading, error } = useLiveData(getFactorySummary, 6500);

  if (loading && !data) return <div className="glass-card text-sm text-zinc-500 dark:text-zinc-400">Chargement des métriques usine...</div>;
  if (error && !data) {
    return <div className="glass-card text-sm text-zinc-500 dark:text-zinc-400">API usine indisponible. Fallback résilient actif...</div>;
  }
  if (!data) return null;

  const operationalRisk = 100 - data.efficiencyScore;
  const tankBalance = 100 - Math.abs(data.tanks.tank1High - data.tanks.tank2High);
  const cycleStatus = data.cycleActive > 10 ? 'Haut débit' : 'Débit nominal';

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Installations actives" value={`${data.installationActive}`} tone="brand" />
        <MetricCard label="Usine opérationnelle" value={data.plantOperational ? 'ON' : 'OFF'} hint="État opérationnel" />
        <MetricCard label="Cycles actifs" value={`${data.cycleActive}`} hint="Processus en cours" />
        <MetricCard label="Cycles terminés" value={`${data.cycleFinished}`} hint="Terminés aujourd'hui" />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Recyclage actif" value={data.recyclingActive ? 'ON' : 'OFF'} icon={Recycle} tone={data.recyclingActive ? 'success' : 'danger'} />
        <MetricCard label="Synthèse des cuves" value={`${data.tankSummary.fullCount} pleines / ${data.tankSummary.lowCount} basses`} />
        <MetricCard label="État des cycles" value={cycleStatus} />
        <MetricCard label="Préparation" value={data.efficiencyScore > 80 ? 'Prêt' : 'Surveillance'} icon={ShieldCheck} tone="success" />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <TankLevelCard title="Cuve 1" low={data.tanks.tank1Low} high={data.tanks.tank1High} />
        <TankLevelCard title="Cuve 2" low={data.tanks.tank2Low} high={data.tanks.tank2High} />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <ScoreCard title="Score d'efficacité" score={data.efficiencyScore} />
        <ScoreCard title="Risque opérationnel" score={Math.max(0, 100 - operationalRisk)} />
        <ScoreCard title="Équilibre des cuves" score={Math.max(0, tankBalance)} />
      </section>

      <article className="glass-card">
  <p className="subtle-label">Bloc d'intelligence process</p>
        <div className="mt-4 flex items-start gap-3 rounded-2xl bg-zinc-100 p-4 dark:bg-zinc-900/60">
          <TriangleAlert className="mt-0.5 text-brand-600 dark:text-brand-400" size={18} />
          <p className="text-sm text-zinc-700 dark:text-zinc-300">
            La ligne process est stable. Le risque est principalement lié aux fluctuations côté bas des cuves. Le recyclage
            reste actif et le débit de cycle indique un haut niveau de préparation opérationnelle.
          </p>
        </div>
      </article>
    </div>
  );
};
