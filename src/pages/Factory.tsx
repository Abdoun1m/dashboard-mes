import { KpiCard } from '../components/kpi/KpiCard';
import { Badge } from '../components/ui/badge';
import { Gauge } from '../components/charts/Gauge';
import { getFactorySummary } from '../services/mesService';
import { useLiveData } from '../hooks/useLiveData';
import { classifyStatus, formatAge, formatPct, safeNumber } from '../utils/format';

export const FactoryPage = () => {
  // Primary data source: /api/factory/summary
  const { data: summary, loading, error, lastUpdated, isFallback } = useLiveData(getFactorySummary, 2000);
  const lastUpdatedTs = lastUpdated ? lastUpdated.getTime() : null;

  // Live status values
  const installationActive = summary?.installationActive ?? 0;
  const plantOperational = summary?.plantOperational ?? 0;
  const cycleActive = summary?.cycleActive ?? 0;
  const cycleFinished = summary?.cycleFinished ?? 0;
  const totalCycles = summary?.totalCycles ?? summary?.cycleCount ?? 0;
  const recyclingActive = summary?.recyclingActive ?? 0;
  const efficiencyScore = safeNumber(summary?.efficiencyScore) ?? null;

  // Tank data from summary
  const tanks = (summary?.tanks as Record<string, number> | undefined) ?? {};
  const tank1Low = safeNumber(tanks.tank1Low) ?? null;
  const tank1High = safeNumber(tanks.tank1High) ?? null;
  const tank2Low = safeNumber(tanks.tank2Low) ?? null;
  const tank2High = safeNumber(tanks.tank2High) ?? null;

  // Tank summary counts
  const tankSummary = (summary?.tankSummary as Record<string, number> | undefined) ?? {};
  const fullCount = safeNumber(tankSummary.fullCount) ?? 0;
  const lowCount = safeNumber(tankSummary.lowCount) ?? 0;

  return (
    <div className="space-y-6">
      {isFallback && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
          <Badge variant="warning" className="mb-2">Données estimées</Badge>
          <p className="text-xs text-amber-700 dark:text-amber-400">Les données affichées proviennent du fallback - l'API en temps réel est actuellement indisponible.</p>
        </div>
      )}

      {/* KPI Cards - Live from /api/factory/summary */}
      <section className="grid gap-4 lg:grid-cols-4">
        <KpiCard
          label="Installation Active"
          value={installationActive ? 'ACTIVE' : 'INACTIVE'}
          tone={installationActive ? 'ok' : 'warning'}
          freshness={formatAge(lastUpdatedTs)}
          status="ok"
          helper="Plant running"
        />
        <KpiCard
          label="Plant Operational"
          value={plantOperational ? 'YES' : 'NO'}
          tone={plantOperational ? 'ok' : 'warning'}
          freshness={formatAge(lastUpdatedTs)}
          status="ok"
          helper="Operational state"
        />
        <KpiCard
          label="Efficiency Score"
          value={efficiencyScore !== null ? formatPct(efficiencyScore, 1) : '—'}
          tone={classifyStatus(efficiencyScore)}
          freshness={formatAge(lastUpdatedTs)}
          status="ok"
          helper="Process efficiency"
        />
        <KpiCard
          label="Total Cycles"
          value={String(totalCycles)}
          tone="info"
          freshness={formatAge(lastUpdatedTs)}
          status="ok"
          helper="Cycles completed"
        />
      </section>

      {/* Installation Status Summary */}
      <section className="panel">
        <p className="panel-title">Installation Status (Live from /api/factory/summary)</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3 text-sm">
          <div className="rounded-md border border-zinc-200/60 px-4 py-3 dark:border-zinc-800">
            <p className="text-zinc-500 dark:text-zinc-400">Installation</p>
            <p className="text-lg font-semibold">{installationActive ? 'ACTIVE' : 'INACTIVE'}</p>
          </div>
          <div className="rounded-md border border-zinc-200/60 px-4 py-3 dark:border-zinc-800">
            <p className="text-zinc-500 dark:text-zinc-400">Plant</p>
            <p className="text-lg font-semibold">{plantOperational ? 'OPERATIONAL' : 'DOWN'}</p>
          </div>
          <div className="rounded-md border border-zinc-200/60 px-4 py-3 dark:border-zinc-800">
            <p className="text-zinc-500 dark:text-zinc-400">Recycling</p>
            <p className="text-lg font-semibold">{recyclingActive ? 'ACTIVE' : 'INACTIVE'}</p>
          </div>
        </div>
      </section>

      {/* Cycle Status */}
      <section className="panel">
        <p className="panel-title">Cycle Status (Live from /api/factory/summary)</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3 text-sm">
          <div className="rounded-md border border-zinc-200/60 px-4 py-3 dark:border-zinc-800">
            <p className="text-zinc-500 dark:text-zinc-400">Active State</p>
            <p className="text-lg font-semibold">{cycleActive ? 'ACTIVE' : 'IDLE'}</p>
          </div>
          <div className="rounded-md border border-zinc-200/60 px-4 py-3 dark:border-zinc-800">
            <p className="text-zinc-500 dark:text-zinc-400">Finished State</p>
            <p className="text-lg font-semibold">{cycleFinished ? 'DONE' : 'WAITING'}</p>
          </div>
          <div className="rounded-md border border-zinc-200/60 px-4 py-3 dark:border-zinc-800">
            <p className="text-zinc-500 dark:text-zinc-400">Total Cycles</p>
            <p className="text-lg font-semibold">{totalCycles}</p>
          </div>
        </div>
      </section>

      {/* Tank Levels */}
      <section className="panel">
        <p className="panel-title">Tank Levels (Live from /api/factory/summary)</p>
        <div className="mt-4 overflow-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-zinc-500 dark:text-zinc-400">
              <tr>
                <th className="pb-2">Tank</th>
                <th className="pb-2">Low Level</th>
                <th className="pb-2">High Level</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-zinc-200/60 dark:border-zinc-800">
                <td className="py-2 font-medium">Tank 1</td>
                <td className="py-2">{tank1Low !== null ? `${tank1Low}%` : '—'}</td>
                <td className="py-2">{tank1High !== null ? `${tank1High}%` : '—'}</td>
              </tr>
              <tr className="border-t border-zinc-200/60 dark:border-zinc-800">
                <td className="py-2 font-medium">Tank 2</td>
                <td className="py-2">{tank2Low !== null ? `${tank2Low}%` : '—'}</td>
                <td className="py-2">{tank2High !== null ? `${tank2High}%` : '—'}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
          <p>Full tanks: {fullCount} | Low tanks: {lowCount}</p>
        </div>
      </section>

      {/* Efficiency Gauge */}
      {efficiencyScore !== null && (
        <section className="panel">
          <p className="panel-title">Efficiency Score</p>
          <div className="mt-4 flex justify-center">
            <Gauge value={efficiencyScore} label="Efficiency" unit="%" tone={classifyStatus(efficiencyScore)} />
          </div>
        </section>
      )}
    </div>
  );
};
