import { BadgeCheck, CircleDashed, Waves } from 'lucide-react';
import { MetricCard } from '../components/cards/MetricCard';
import { ScoreCard } from '../components/cards/ScoreCard';
import { SourceMixChart } from '../components/charts/SourceMixChart';
import { SourceOutputChart } from '../components/charts/SourceOutputChart';
import { StatusBadge } from '../components/status/StatusBadge';
import { useLiveData } from '../hooks/useLiveData';
import { getPowerGridSummary } from '../services/mesService';
import { num, pct } from '../utils/format';

export const PowerGridPage = () => {
  const { data, loading, error } = useLiveData(getPowerGridSummary, 6000);

  if (loading && !data) return <div className="glass-card text-sm text-zinc-500 dark:text-zinc-400">Chargement du résumé réseau...</div>;
  if (error && !data) {
    return <div className="glass-card text-sm text-zinc-500 dark:text-zinc-400">API PowerGrid indisponible. Fallback résilient actif...</div>;
  }
  if (!data) return null;

  const stabilityScore = Math.min(100, Math.max(0, Math.round((data.tap / Math.max(1, data.tcp)) * 100)));
  const reserveMargin = Number(((data.delta / Math.max(1, data.tcp)) * 100).toFixed(1));
  const utilizationRate = Number(((data.tcp / Math.max(1, data.totalProduction)) * 100).toFixed(1));
  const supplyRatio = Number((data.tap / Math.max(1, data.tcp)).toFixed(2));
  const dominantSource = Object.entries(data.sources).sort((a, b) => b[1] - a[1])[0][0];
  const sourceLabel: Record<string, string> = { wind: 'Éolien', solar: 'Solaire', gas: 'Gaz' };
  const sourceDiversityIndex = 100 - Math.abs(data.sourceMix.windPct - data.sourceMix.solarPct) - Math.abs(data.sourceMix.solarPct - data.sourceMix.gasPct);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    <MetricCard label="Production totale (TAP)" value={`${num(data.tap)} MW`} icon={Waves} tone="brand" />
    <MetricCard label="Consommation totale (TCP)" value={`${num(data.tcp)} MW`} icon={CircleDashed} />
    <MetricCard label="Delta énergie" value={`${num(data.delta)} MW`} icon={BadgeCheck} tone={data.delta >= 0 ? 'success' : 'danger'} />
    <MetricCard label="Production globale" value={`${num(data.totalProduction)} MW`} hint="Flux live synthétique" />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Sources actives" value={`${data.activeSources} / 3`} />
        <MetricCard label="Score de stabilité réseau" value={`${stabilityScore}`} hint="équilibre TAP vs TCP" />
        <MetricCard label="Marge de réserve" value={pct(reserveMargin, 1)} />
        <MetricCard label="Taux d'utilisation" value={pct(utilizationRate, 1)} />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <SourceOutputChart wind={data.sources.wind} solar={data.sources.solar} gas={data.sources.gas} />
        <SourceMixChart windPct={data.sourceMix.windPct} solarPct={data.sourceMix.solarPct} gasPct={data.sourceMix.gasPct} />
        <div className="glass-card space-y-4">
          <p className="subtle-label">États des sources</p>
          <div className="flex flex-wrap gap-2">
            <StatusBadge label="ÉOLIEN" active={data.sourceStates.wind === 1} />
            <StatusBadge label="SOLAIRE" active={data.sourceStates.solar === 1} />
            <StatusBadge label="GAZ" active={data.sourceStates.gas === 1} />
          </div>
          <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
            <p className="flex justify-between"><span>Ratio d'approvisionnement</span><strong>{supplyRatio}</strong></p>
            <p className="flex justify-between"><span>Source dominante</span><strong>{sourceLabel[dominantSource] ?? dominantSource}</strong></p>
            <p className="flex justify-between"><span>Indice de diversité</span><strong>{Math.max(12, sourceDiversityIndex)}</strong></p>
          </div>
          <ScoreCard title="Confiance énergétique exécutive" score={stabilityScore} />
        </div>
      </section>
    </div>
  );
};
