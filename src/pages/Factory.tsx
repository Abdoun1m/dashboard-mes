import { KpiCard } from '../components/kpi/KpiCard';
import { Badge } from '../components/ui/badge';
import { Gauge } from '../components/charts/Gauge';
import { MultiLineTrendChart } from '../components/charts/MultiLineTrendChart';
import { ScoreTimelineChart } from '../components/charts/ScoreTimelineChart';
import { ThroughputChart } from '../components/charts/ThroughputChart';
import { getFactorySummary } from '../services/mesService';
import { useLiveData } from '../hooks/useLiveData';
import { classifyStatus, formatAge, formatPct, safeNumber } from '../utils/format';

const STALE_AFTER_MS = 120_000;

const isStale = (sourceUpdatedAt: string | undefined): boolean => {
  if (!sourceUpdatedAt) return false;
  const ts = Date.parse(sourceUpdatedAt);
  if (!Number.isFinite(ts)) return false;
  return Date.now() - ts > STALE_AFTER_MS;
};

export const FactoryPage = () => {
  const { data: summary, lastUpdated, isFallback } = useLiveData(getFactorySummary, 2000);
  const lastUpdatedTs = lastUpdated ? lastUpdated.getTime() : null;

  const source = summary?.source ?? 'unknown';
  const stale = isStale(summary?.sourceUpdatedAt);

  const cycleActive = Boolean(summary?.cycleActive);
  const cycleFinished = Boolean(summary?.cycleFinished);
  const totalCycles = safeNumber(summary?.totalCycles ?? summary?.cycleCount) ?? 0;
  const oee = safeNumber(summary?.oee ?? summary?.efficiencyScore) ?? null;
  const quality = safeNumber(summary?.qualityPercent) ?? null;
  const availability = safeNumber(summary?.availabilityPercent) ?? null;
  const performance = safeNumber(summary?.performancePercent) ?? null;
  const totalGood = safeNumber(summary?.totalGood) ?? null;
  const totalReject = safeNumber(summary?.totalReject) ?? null;
  const throughputPerMin = safeNumber(summary?.throughputPerMin) ?? null;
  const throughputPerHour = safeNumber(summary?.throughputPerHour) ?? null;
  const loadPercent = safeNumber(summary?.loadPercent) ?? null;

  const oeeHistory = summary?.oeeHistory ?? [];
  const qapHistory = summary?.qapHistory ?? [];
  const throughputHistory = summary?.throughputHistory ?? [];
  const cycleHistory = summary?.cycleHistory ?? [];
  const stateHistory = summary?.stateHistory ?? [];

  return (
    <div className="space-y-6">
      {isFallback && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
          <Badge variant="warning" className="mb-2">Données estimées</Badge>
          <p className="text-xs text-amber-700 dark:text-amber-400">Le flux live API est indisponible, le dashboard affiche des données de repli.</p>
        </div>
      )}

      <section className="grid gap-4 lg:grid-cols-4">
        <KpiCard
          label="OEE"
          value={oee !== null ? formatPct(oee, 1) : '—'}
          tone={classifyStatus(oee)}
          freshness={formatAge(lastUpdatedTs)}
          status={oee !== null && oee < 60 ? 'risk' : 'ok'}
          helper="Main factory efficiency KPI"
          source={source}
          isFallback={isFallback}
          isStale={stale}
        />
        <KpiCard
          label="Total Cycles"
          value={String(totalCycles)}
          tone="info"
          freshness={formatAge(lastUpdatedTs)}
          status="counter"
          helper="Authoritative cycle counter"
          source={source}
          isFallback={isFallback}
          isStale={stale}
        />
        <KpiCard
          label="Cycle Active"
          value={cycleActive ? 'ACTIVE' : 'IDLE'}
          tone={cycleActive ? 'ok' : 'muted'}
          freshness={formatAge(lastUpdatedTs)}
          status="state"
          helper="State flag only"
          source={source}
          isFallback={isFallback}
          isStale={stale}
        />
        <KpiCard
          label="Cycle Finished"
          value={cycleFinished ? 'DONE' : 'WAITING'}
          tone={cycleFinished ? 'ok' : 'warning'}
          freshness={formatAge(lastUpdatedTs)}
          status="state"
          helper="State flag only"
          source={source}
          isFallback={isFallback}
          isStale={stale}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-4">
        <KpiCard
          label="Quality"
          value={quality !== null ? formatPct(quality, 1) : '—'}
          tone={classifyStatus(quality)}
          freshness={formatAge(lastUpdatedTs)}
          status="q"
          source={source}
          isFallback={isFallback}
          isStale={stale}
        />
        <KpiCard
          label="Availability"
          value={availability !== null ? formatPct(availability, 1) : '—'}
          tone={classifyStatus(availability)}
          freshness={formatAge(lastUpdatedTs)}
          status="a"
          source={source}
          isFallback={isFallback}
          isStale={stale}
        />
        <KpiCard
          label="Performance"
          value={performance !== null ? formatPct(performance, 1) : '—'}
          tone={classifyStatus(performance)}
          freshness={formatAge(lastUpdatedTs)}
          status="p"
          source={source}
          isFallback={isFallback}
          isStale={stale}
        />
        <KpiCard
          label="LoadPercent"
          value={loadPercent !== null ? formatPct(loadPercent, 1) : '—'}
          tone={classifyStatus(loadPercent)}
          freshness={formatAge(lastUpdatedTs)}
          status="load"
          source={source}
          isFallback={isFallback}
          isStale={stale}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-4">
        <KpiCard
          label="TotalGood"
          value={totalGood !== null ? String(totalGood) : '—'}
          tone="ok"
          freshness={formatAge(lastUpdatedTs)}
          status="count"
          source={source}
          isFallback={isFallback}
          isStale={stale}
        />
        <KpiCard
          label="TotalReject"
          value={totalReject !== null ? String(totalReject) : '—'}
          tone={totalReject !== null && totalReject > 0 ? 'warning' : 'ok'}
          freshness={formatAge(lastUpdatedTs)}
          status="count"
          source={source}
          isFallback={isFallback}
          isStale={stale}
        />
        <KpiCard
          label="Throughput/min"
          value={throughputPerMin !== null ? throughputPerMin.toFixed(2) : '—'}
          tone="info"
          freshness={formatAge(lastUpdatedTs)}
          status="tph"
          source={source}
          isFallback={isFallback}
          isStale={stale}
        />
        <KpiCard
          label="Throughput/hour"
          value={throughputPerHour !== null ? throughputPerHour.toFixed(1) : '—'}
          tone="info"
          freshness={formatAge(lastUpdatedTs)}
          status="tph"
          source={source}
          isFallback={isFallback}
          isStale={stale}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <div className="panel">
          <p className="panel-title">OEE History</p>
          <ScoreTimelineChart data={oeeHistory} color="#10b981" />
        </div>
        <div className="panel flex items-center justify-center">
          {oee !== null ? (
            <Gauge value={oee} label="Current OEE" unit="%" tone={classifyStatus(oee)} />
          ) : (
            <p className="text-xs text-zinc-500">No OEE data available.</p>
          )}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="panel">
          <p className="panel-title">Q / A / P History</p>
          <MultiLineTrendChart
            data={qapHistory}
            domain={[0, 100]}
            formatter={(value) => `${value.toFixed(1)}%`}
            lines={[
              { key: 'quality', label: 'Quality', color: '#10b981' },
              { key: 'availability', label: 'Availability', color: '#3b82f6' },
              { key: 'performance', label: 'Performance', color: '#f97316' }
            ]}
          />
        </div>
        <div className="panel">
          <p className="panel-title">Throughput History</p>
          <MultiLineTrendChart
            data={throughputHistory}
            formatter={(value) => value.toFixed(2)}
            lines={[
              { key: 'perMin', label: 'Per minute', color: '#8b5cf6' },
              { key: 'perHour', label: 'Per hour', color: '#0ea5e9' }
            ]}
          />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="panel">
          <p className="panel-title">Cycle Counter History</p>
          <ThroughputChart data={cycleHistory} />
        </div>
        <div className="panel">
          <p className="panel-title">Factory State History</p>
          <MultiLineTrendChart
            data={stateHistory}
            domain={[0, 1]}
            formatter={(value) => value.toFixed(0)}
            lines={[
              { key: 'installationActive', label: 'Installation', color: '#22c55e' },
              { key: 'cycleActive', label: 'Cycle Active', color: '#3b82f6' },
              { key: 'cycleFinished', label: 'Cycle Finished', color: '#f97316' },
              { key: 'recyclingActive', label: 'Recycling', color: '#ef4444' }
            ]}
          />
        </div>
      </section>
    </div>
  );
};
