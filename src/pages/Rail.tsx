import { KpiCard } from '../components/kpi/KpiCard';
import { Badge } from '../components/ui/badge';
import { Gauge } from '../components/charts/Gauge';
import { useLiveData } from '../hooks/useLiveData';
import { getRailSummary } from '../services/mesService';
import { classifyStatus, formatAge, formatPct, safeNumber } from '../utils/format';

export const RailPage = () => {
  // Primary data source: /api/railauto/summary
  const { data: summary, loading, error, lastUpdated, isFallback } = useLiveData(getRailSummary, 2000);
  const lastUpdatedTs = lastUpdated ? lastUpdated.getTime() : null;

  // Live values from summary
  const progress = safeNumber(summary?.progress) ?? null;
  const ratio = safeNumber(summary?.ratio) ?? null;
  const blockRisk = safeNumber(summary?.blockRisk) ?? null;
  const completedSteps = safeNumber(summary?.completedSteps) ?? 0;

  // Step indicators
  const step1 = summary?.step1 ?? 0;
  const step2 = summary?.step2 ?? 0;
  const step3 = summary?.step3 ?? 0;
  const step4 = summary?.step4 ?? 0;

  return (
    <div className="space-y-6">
      {isFallback && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
          <Badge variant="warning" className="mb-2">Données estimées</Badge>
          <p className="text-xs text-amber-700 dark:text-amber-400">Les données affichées proviennent du fallback - l'API en temps réel est actuellement indisponible.</p>
        </div>
      )}

      {/* KPI Cards - Live from /api/railauto/summary */}
      <section className="grid gap-4 lg:grid-cols-4">
        <KpiCard
          label="Progress"
          value={progress !== null ? `${formatPct(progress, 1)}` : '—'}
          tone={classifyStatus(progress)}
          freshness={formatAge(lastUpdatedTs)}
          status="ok"
          helper="Route completion %"
        />
        <KpiCard
          label="Efficiency Ratio"
          value={ratio !== null ? ratio.toFixed(2) : '—'}
          tone={ratio !== null && ratio > 0.7 ? 'ok' : 'warning'}
          freshness={formatAge(lastUpdatedTs)}
          status="ok"
          helper="Route efficiency"
        />
        <KpiCard
          label="Block Risk"
          value={blockRisk !== null ? `${formatPct(blockRisk, 0)}` : '—'}
          tone={blockRisk !== null && blockRisk > 50 ? 'critical' : blockRisk !== null && blockRisk > 30 ? 'warning' : 'ok'}
          freshness={formatAge(lastUpdatedTs)}
          status="ok"
          helper="Congestion risk"
        />
        <KpiCard
          label="Completed Steps"
          value={String(completedSteps)}
          tone="info"
          freshness={formatAge(lastUpdatedTs)}
          status="ok"
          helper="Steps completed"
        />
      </section>

      {/* Progress Section */}
      <section className="panel">
        <p className="panel-title">Overall Progress (Live from /api/railauto/summary)</p>
        <div className="mt-4 space-y-4">
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-medium">Progress: {progress !== null ? `${formatPct(progress, 1)}` : '—'}</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">{completedSteps}/4 steps</span>
            </div>
            <div className="h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${Math.min(progress ?? 0, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Step Indicators */}
      <section className="panel">
        <p className="panel-title">Route Steps (Live from /api/railauto/summary)</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-4 text-sm">
          <div className={`rounded-md border-2 px-4 py-3 text-center ${step1 ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'border-zinc-200 dark:border-zinc-800'}`}>
            <p className="text-xs font-semibold">Step 1</p>
            <p className="text-lg">{step1 ? '✓' : '○'}</p>
          </div>
          <div className={`rounded-md border-2 px-4 py-3 text-center ${step2 ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'border-zinc-200 dark:border-zinc-800'}`}>
            <p className="text-xs font-semibold">Step 2</p>
            <p className="text-lg">{step2 ? '✓' : '○'}</p>
          </div>
          <div className={`rounded-md border-2 px-4 py-3 text-center ${step3 ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'border-zinc-200 dark:border-zinc-800'}`}>
            <p className="text-xs font-semibold">Step 3</p>
            <p className="text-lg">{step3 ? '✓' : '○'}</p>
          </div>
          <div className={`rounded-md border-2 px-4 py-3 text-center ${step4 ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'border-zinc-200 dark:border-zinc-800'}`}>
            <p className="text-xs font-semibold">Step 4</p>
            <p className="text-lg">{step4 ? '✓' : '○'}</p>
          </div>
        </div>
      </section>

      {/* Metrics Gauges */}
      <section className="grid gap-4 xl:grid-cols-3">
        {ratio !== null && (
          <div className="panel flex justify-center items-center">
            <Gauge value={(ratio * 100) || 0} label="Efficiency Ratio" unit="%" tone={ratio > 0.7 ? 'ok' : 'warning'} />
          </div>
        )}
        {blockRisk !== null && (
          <div className="panel flex justify-center items-center">
            <Gauge value={blockRisk} label="Block Risk" unit="%" tone={blockRisk > 50 ? 'critical' : blockRisk > 30 ? 'warning' : 'ok'} />
          </div>
        )}
        {progress !== null && (
          <div className="panel flex justify-center items-center">
            <Gauge value={progress} label="Progress" unit="%" tone={classifyStatus(progress)} />
          </div>
        )}
      </section>

      {/* System Status */}
      <section className="panel">
        <p className="panel-title">System Status (Live from /api/railauto/summary)</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
          <div className="rounded-md border border-zinc-200/60 px-4 py-3 dark:border-zinc-800">
            <p className="text-zinc-500 dark:text-zinc-400">Efficiency Ratio</p>
            <p className="text-lg font-semibold">{ratio !== null ? ratio.toFixed(3) : '—'}</p>
          </div>
          <div className="rounded-md border border-zinc-200/60 px-4 py-3 dark:border-zinc-800">
            <p className="text-zinc-500 dark:text-zinc-400">Block Risk</p>
            <p className="text-lg font-semibold">{blockRisk !== null ? `${blockRisk.toFixed(1)}%` : '—'}</p>
          </div>
        </div>
      </section>
    </div>
  );
};
