import { KpiCard } from '../components/kpi/KpiCard';
import { Badge } from '../components/ui/badge';
import { MultiLineTrendChart } from '../components/charts/MultiLineTrendChart';
import { ScoreTimelineChart } from '../components/charts/ScoreTimelineChart';
import { ThroughputChart } from '../components/charts/ThroughputChart';
import { useLiveData } from '../hooks/useLiveData';
import { getRailSummary } from '../services/mesService';
import { classifyStatus, formatAge, formatPct, safeNumber } from '../utils/format';

const STALE_AFTER_MS = 120_000;

const isStale = (sourceUpdatedAt: string | undefined): boolean => {
  if (!sourceUpdatedAt) return false;
  const ts = Date.parse(sourceUpdatedAt);
  if (!Number.isFinite(ts)) return false;
  return Date.now() - ts > STALE_AFTER_MS;
};

export const RailPage = () => {
  const { data: summary, lastUpdated, isFallback } = useLiveData(getRailSummary, 2000);
  const lastUpdatedTs = lastUpdated ? lastUpdated.getTime() : null;
  const source = summary?.source ?? 'unknown';
  const stale = isStale(summary?.sourceUpdatedAt);

  const railAuto = summary?.railAuto;
  const railManual = summary?.railManual;

  const progressPct = safeNumber(railAuto?.progressPct ?? summary?.progress) ?? null;
  const step = safeNumber(railAuto?.step) ?? null;
  const cycleActive = Boolean(railAuto?.cycleActive);
  const cycleDone = Boolean(railAuto?.cycleDone);
  const state = railAuto?.state;
  const faultType = railAuto?.faultType;
  const integrity = railAuto?.integrity;
  const autoThroughput = safeNumber(railAuto?.throughput) ?? null;

  const fesRouteValid = Boolean(railManual?.fesRouteValid);
  const marrakechRouteValid = Boolean(railManual?.marrakechRouteValid);
  const directionConflict = Boolean(railManual?.directionConflict);
  const totalCycleCount = safeNumber(railManual?.totalCycleCount) ?? null;
  const fesCycleCount = safeNumber(railManual?.fesCycleCount) ?? null;
  const marrakechCycleCount = safeNumber(railManual?.marrakechCycleCount) ?? null;
  const safetyScore = safeNumber(railManual?.safetyScore) ?? null;
  const routingScore = safeNumber(railManual?.routingScore) ?? null;

  return (
    <div className="space-y-6">
      {isFallback && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
          <Badge variant="warning" className="mb-2">Données estimées</Badge>
          <p className="text-xs text-amber-700 dark:text-amber-400">Le flux live API est indisponible, le dashboard affiche des données de repli.</p>
        </div>
      )}

      <section className="panel">
        <p className="panel-title">RailAuto</p>
        <div className="mt-4 grid gap-4 lg:grid-cols-4">
          <KpiCard
            label="Progress"
            value={progressPct !== null ? formatPct(progressPct, 1) : '—'}
            tone={classifyStatus(progressPct)}
            freshness={formatAge(lastUpdatedTs)}
            status="auto"
            helper="MES.ProgressPercent"
            source={source}
            isFallback={isFallback}
            isStale={stale}
          />
          <KpiCard
            label="Current Step"
            value={step !== null ? String(step) : '—'}
            tone="info"
            freshness={formatAge(lastUpdatedTs)}
            status="auto"
            helper="MES.Step"
            source={source}
            isFallback={isFallback}
            isStale={stale}
          />
          <KpiCard
            label="Cycle State"
            value={cycleActive ? 'ACTIVE' : cycleDone ? 'DONE' : 'IDLE'}
            tone={cycleActive ? 'ok' : cycleDone ? 'info' : 'muted'}
            freshness={formatAge(lastUpdatedTs)}
            status="auto"
            helper="MES.CycleActive / MES.CycleDone"
            source={source}
            isFallback={isFallback}
            isStale={stale}
          />
          <KpiCard
            label="Integrity"
            value={integrity === undefined ? '—' : integrity ? 'OK' : 'ALERT'}
            tone={integrity ? 'ok' : 'warning'}
            freshness={formatAge(lastUpdatedTs)}
            status="auto"
            helper="MES.Integrity"
            source={source}
            isFallback={isFallback}
            isStale={stale}
          />
          <KpiCard
            label="State"
            value={state === undefined ? '—' : String(state)}
            tone="info"
            freshness={formatAge(lastUpdatedTs)}
            status="auto"
            helper="MES.State"
            source={source}
            isFallback={isFallback}
            isStale={stale}
          />
          <KpiCard
            label="Fault Type"
            value={faultType === undefined ? '—' : String(faultType)}
            tone={safeNumber(faultType) !== null && safeNumber(faultType)! > 0 ? 'warning' : 'ok'}
            freshness={formatAge(lastUpdatedTs)}
            status="auto"
            helper="MES.FaultType"
            source={source}
            isFallback={isFallback}
            isStale={stale}
          />
          <KpiCard
            label="Throughput"
            value={autoThroughput !== null ? autoThroughput.toFixed(2) : '—'}
            tone="info"
            freshness={formatAge(lastUpdatedTs)}
            status="auto"
            helper="MES.Throughput"
            source={source}
            isFallback={isFallback}
            isStale={stale}
          />
          <KpiCard
            label="Block Risk"
            value={summary?.blockRisk !== undefined ? formatPct(summary.blockRisk, 1) : '—'}
            tone={classifyStatus(summary?.blockRisk, 60, 30)}
            freshness={formatAge(lastUpdatedTs)}
            status="auto"
            helper="Derived conflict/fault risk"
            source={source}
            isFallback={isFallback}
            isStale={stale}
          />
        </div>
      </section>

      <section className="panel">
        <p className="panel-title">RailManual</p>
        <div className="mt-4 grid gap-4 lg:grid-cols-4">
          <KpiCard
            label="FES Route"
            value={fesRouteValid ? 'VALID' : 'INVALID'}
            tone={fesRouteValid ? 'ok' : 'warning'}
            freshness={formatAge(lastUpdatedTs)}
            status="manual"
            helper="MES.FESRouteValid"
            source={source}
            isFallback={isFallback}
            isStale={stale}
          />
          <KpiCard
            label="Marrakech Route"
            value={marrakechRouteValid ? 'VALID' : 'INVALID'}
            tone={marrakechRouteValid ? 'ok' : 'warning'}
            freshness={formatAge(lastUpdatedTs)}
            status="manual"
            helper="MES.MarrakechRouteValid"
            source={source}
            isFallback={isFallback}
            isStale={stale}
          />
          <KpiCard
            label="Direction Conflict"
            value={directionConflict ? 'YES' : 'NO'}
            tone={directionConflict ? 'critical' : 'ok'}
            freshness={formatAge(lastUpdatedTs)}
            status="manual"
            helper="MES.DirectionConflict"
            source={source}
            isFallback={isFallback}
            isStale={stale}
          />
          <KpiCard
            label="Total Cycles"
            value={totalCycleCount !== null ? String(totalCycleCount) : '—'}
            tone="info"
            freshness={formatAge(lastUpdatedTs)}
            status="manual"
            helper="MES.TotalCycleCount"
            source={source}
            isFallback={isFallback}
            isStale={stale}
          />
          <KpiCard
            label="FES Cycles"
            value={fesCycleCount !== null ? String(fesCycleCount) : '—'}
            tone="info"
            freshness={formatAge(lastUpdatedTs)}
            status="manual"
            helper="MES.FESCycleCount"
            source={source}
            isFallback={isFallback}
            isStale={stale}
          />
          <KpiCard
            label="Marrakech Cycles"
            value={marrakechCycleCount !== null ? String(marrakechCycleCount) : '—'}
            tone="info"
            freshness={formatAge(lastUpdatedTs)}
            status="manual"
            helper="MES.MarrakechCycleCount"
            source={source}
            isFallback={isFallback}
            isStale={stale}
          />
          <KpiCard
            label="Safety Score"
            value={safetyScore !== null ? formatPct(safetyScore, 1) : '—'}
            tone={classifyStatus(safetyScore)}
            freshness={formatAge(lastUpdatedTs)}
            status="manual"
            helper="MES.SafetyScore"
            source={source}
            isFallback={isFallback}
            isStale={stale}
          />
          <KpiCard
            label="Routing Score"
            value={routingScore !== null ? formatPct(routingScore, 1) : '—'}
            tone={classifyStatus(routingScore)}
            freshness={formatAge(lastUpdatedTs)}
            status="manual"
            helper="MES.RoutingScore"
            source={source}
            isFallback={isFallback}
            isStale={stale}
          />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="panel">
          <p className="panel-title">Progress Trend</p>
          <ScoreTimelineChart data={railAuto?.progressHistory ?? []} color="#2563eb" />
        </div>
        <div className="panel">
          <p className="panel-title">Throughput Trend</p>
          <ThroughputChart data={railAuto?.throughputHistory ?? []} />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="panel">
          <p className="panel-title">Conflict Trend</p>
          <ScoreTimelineChart data={railManual?.conflictHistory ?? []} color="#ef4444" />
        </div>
        <div className="panel">
          <p className="panel-title">Safety & Routing Trend</p>
          <MultiLineTrendChart
            data={(railManual?.safetyHistory ?? []).map((point, index) => ({
              timestamp: point.timestamp,
              safety: point.value,
              routing: railManual?.routingHistory?.[index]?.value ?? 0
            }))}
            domain={[0, 100]}
            formatter={(value) => `${value.toFixed(1)}%`}
            lines={[
              { key: 'safety', label: 'Safety', color: '#16a34a' },
              { key: 'routing', label: 'Routing', color: '#f97316' }
            ]}
          />
        </div>
      </section>
    </div>
  );
};
