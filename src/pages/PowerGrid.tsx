import { KpiCard } from '../components/kpi/KpiCard';
import { Badge } from '../components/ui/badge';
import { MultiLineTrendChart } from '../components/charts/MultiLineTrendChart';
import { ProductionConsumptionAreaChart } from '../components/charts/ProductionConsumptionAreaChart';
import { ScoreTimelineChart } from '../components/charts/ScoreTimelineChart';
import { SourceMixDonut } from '../components/charts/SourceMixDonut';
import { ThroughputChart } from '../components/charts/ThroughputChart';
import { useLiveData } from '../hooks/useLiveData';
import { getPowerGridSummary } from '../services/mesService';
import { classifyStatus, formatAge, formatKw, safeNumber } from '../utils/format';

const STALE_AFTER_MS = 120_000;

const isStale = (sourceUpdatedAt: string | undefined): boolean => {
  if (!sourceUpdatedAt) return false;
  const ts = Date.parse(sourceUpdatedAt);
  if (!Number.isFinite(ts)) return false;
  return Date.now() - ts > STALE_AFTER_MS;
};

export const PowerGridPage = () => {
  const { data: summary, lastUpdated, isFallback } = useLiveData(getPowerGridSummary, 2000);
  const lastUpdatedTs = lastUpdated ? lastUpdated.getTime() : null;
  const source = summary?.source ?? 'unknown';
  const stale = isStale(summary?.sourceUpdatedAt);

  const totalProduction = safeNumber(summary?.totalProduction ?? summary?.tap) ?? null;
  const totalConsumption = safeNumber(summary?.totalConsumption ?? summary?.tcp) ?? null;
  const reserveMargin = safeNumber(summary?.reserveMargin ?? summary?.reserve) ?? null;
  const losses = safeNumber(summary?.losses) ?? null;

  const sourceMixData = [
    { name: 'PE', value: safeNumber(summary?.sourceMix?.pe ?? summary?.sourceMix?.PE) ?? 0 },
    { name: 'FS', value: safeNumber(summary?.sourceMix?.fs ?? summary?.sourceMix?.FS) ?? 0 },
    { name: 'GS', value: safeNumber(summary?.sourceMix?.gs ?? summary?.sourceMix?.GS) ?? 0 }
  ].filter((item) => item.value > 0);

  const demandHistory = summary?.demandHistory ?? [];
  const balanceHistory = summary?.balanceHistory ?? [];

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
          label="Total Production"
          value={totalProduction !== null ? formatKw(totalProduction) : '—'}
          tone={classifyStatus(totalProduction)}
          freshness={formatAge(lastUpdatedTs)}
          status={summary?.balanceStatus ?? '—'}
          helper="MES.TotalProduction"
          source={source}
          isFallback={isFallback}
          isStale={stale}
        />
        <KpiCard
          label="Total Consumption"
          value={totalConsumption !== null ? formatKw(totalConsumption) : '—'}
          tone={classifyStatus(totalConsumption)}
          freshness={formatAge(lastUpdatedTs)}
          status={summary?.balanceStatus ?? '—'}
          helper="MES.TotalConsumption"
          source={source}
          isFallback={isFallback}
          isStale={stale}
        />
        <KpiCard
          label="Reserve Margin"
          value={reserveMargin !== null ? formatKw(reserveMargin) : '—'}
          tone={reserveMargin !== null && reserveMargin < 0 ? 'critical' : 'ok'}
          freshness={formatAge(lastUpdatedTs)}
          status="reserve"
          helper="MES.ReserveMargin"
          source={source}
          isFallback={isFallback}
          isStale={stale}
        />
        <KpiCard
          label="Losses"
          value={losses !== null ? formatKw(losses) : '—'}
          tone={losses !== null && losses > 40 ? 'warning' : 'ok'}
          freshness={formatAge(lastUpdatedTs)}
          status="losses"
          helper="MES.Losses"
          source={source}
          isFallback={isFallback}
          isStale={stale}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <div className="panel">
          <p className="panel-title">Production / Consumption History</p>
          <ProductionConsumptionAreaChart data={balanceHistory} />
        </div>
        <div className="panel">
          <p className="panel-title">Source Mix</p>
          <SourceMixDonut data={sourceMixData} />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="panel">
          <p className="panel-title">Reserve History</p>
          <ThroughputChart data={summary?.reserveHistory ?? []} />
        </div>
        <div className="panel">
          <p className="panel-title">Losses History</p>
          <ScoreTimelineChart data={summary?.lossesHistory ?? []} color="#ef4444" />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="panel">
          <p className="panel-title">Source Mix History (PE / FS / GS)</p>
          <MultiLineTrendChart
            data={summary?.sourceMixHistory ?? []}
            domain={[0, 100]}
            formatter={(value) => `${value.toFixed(1)}%`}
            lines={[
              { key: 'pe', label: 'PE', color: '#0ea5e9' },
              { key: 'fs', label: 'FS', color: '#f97316' },
              { key: 'gs', label: 'GS', color: '#22c55e' }
            ]}
          />
        </div>
        <div className="panel">
          <p className="panel-title">Demand by Client History</p>
          <MultiLineTrendChart
            data={demandHistory}
            formatter={(value) => value.toFixed(1)}
            lines={[
              { key: 'factory', label: 'Factory', color: '#3b82f6' },
              { key: 'homes', label: 'Homes', color: '#8b5cf6' },
              { key: 'railway', label: 'Railway', color: '#14b8a6' }
            ]}
          />
        </div>
      </section>

      <section className="panel">
        <p className="panel-title">Served Status</p>
        <div className="mt-3 overflow-auto">
          <table className="w-full text-xs">
            <thead className="text-left text-zinc-500 dark:text-zinc-400">
              <tr>
                <th className="pb-2">Client</th>
                <th className="pb-2">Demand</th>
                <th className="pb-2">Served</th>
              </tr>
            </thead>
            <tbody>
              {(summary?.servedStatus ?? []).map((row, index) => {
                const item = row as Record<string, unknown>;
                return (
                  <tr key={index} className="border-t border-zinc-200/60 dark:border-zinc-800">
                    <td className="py-2">{String(item.zone ?? item.client ?? `C${index + 1}`)}</td>
                    <td className="py-2">{safeNumber(item.demand) ?? '—'}</td>
                    <td className="py-2">{safeNumber(item.served) ?? '—'}</td>
                  </tr>
                );
              })}
              {!summary?.servedStatus?.length && (
                <tr>
                  <td className="py-3 text-zinc-500" colSpan={3}>No served status available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
