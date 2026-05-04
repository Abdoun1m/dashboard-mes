import { KpiCard } from '../components/kpi/KpiCard';
import { StatusPill } from '../components/kpi/StatusPill';
import { FreshnessSparkline } from '../components/charts/FreshnessSparkline';
import { useMesQuery } from '../hooks/useMesQuery';
import { formatAge, formatPct, safeNumber } from '../utils/format';

export const PipelinePage = () => {
  const pipeline = useMesQuery<Record<string, unknown> | unknown[]>(['mes', 'pipeline'], '/api/mes/pipeline');
  const freshness = useMesQuery<Record<string, unknown> | unknown[]>(['mes', 'freshness'], '/api/mes/freshness');

  const pipelineObj = Array.isArray(pipeline.data) ? null : pipeline.data;
  const pipelineRows = Array.isArray(pipeline.data) ? pipeline.data : (pipelineObj?.stages as Record<string, unknown>[] | undefined) ?? [];
  const freshnessObj = Array.isArray(freshness.data) ? null : freshness.data;
  const freshnessSeries = Array.isArray(freshness.data)
    ? freshness.data.map((point, index) => ({
        timestamp: String((point as Record<string, unknown>).timestamp ?? index + 1),
        value: safeNumber((point as Record<string, unknown>).value) ?? 0
      }))
    : [];

  const heartbeat = pipelineObj?.heartbeat ?? pipelineObj?.lastHeartbeat ?? '—';

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-3">
        <KpiCard
          label="Pipeline heartbeat"
          value={String(heartbeat)}
          tone="info"
          freshness={formatAge(pipeline.lastUpdated)}
          status={pipeline.freshness}
          helper="OT → DMZ → Node-RED"
        />
        <KpiCard
          label="Freshness"
          value={freshness.freshness}
          tone={freshness.freshness === 'fresh' ? 'ok' : 'warning'}
          freshness={formatAge(freshness.lastUpdated)}
          status={freshness.freshness}
          helper="Data staleness"
        />
        <KpiCard
          label="Pipeline stages"
          value={String(pipelineRows.length)}
          tone="muted"
          freshness={formatAge(pipeline.lastUpdated)}
          status={pipeline.freshness}
          helper="Tracked pipeline segments"
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <div className="panel">
          <p className="panel-title">Pipeline health</p>
          <div className="mt-3 space-y-2 text-xs">
            {pipelineRows.length ? (
              pipelineRows.map((row, index) => (
                <div key={index} className="flex items-center justify-between rounded-md border border-zinc-200/60 px-3 py-2 dark:border-zinc-800">
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {String((row as Record<string, unknown>).stage ?? (row as Record<string, unknown>).name ?? `Stage ${index + 1}`)}
                    </p>
                    <p className="text-zinc-500 dark:text-zinc-400">
                      {String((row as Record<string, unknown>).detail ?? (row as Record<string, unknown>).status ?? '—')}
                    </p>
                  </div>
                  <StatusPill
                    label="status"
                    value={String((row as Record<string, unknown>).state ?? (row as Record<string, unknown>).status ?? 'unknown')}
                    tone={(row as Record<string, unknown>).state === 'degraded' ? 'warning' : 'ok'}
                  />
                </div>
              ))
            ) : (
              <p className="text-zinc-500">No pipeline stages reported.</p>
            )}
          </div>
        </div>

        <div className="panel">
          <p className="panel-title">Freshness profile</p>
          <FreshnessSparkline data={freshnessSeries} />
          <div className="mt-3 space-y-2 text-xs text-zinc-600 dark:text-zinc-300">
            <div className="flex items-center justify-between rounded-md border border-zinc-200/60 px-3 py-2 dark:border-zinc-800">
              <span>Latest staleness</span>
              <span>{formatAge(freshness.lastUpdated)}</span>
            </div>
            <div className="flex items-center justify-between rounded-md border border-zinc-200/60 px-3 py-2 dark:border-zinc-800">
              <span>Quality index</span>
              <span>{formatPct(safeNumber(freshnessObj?.quality ?? freshnessObj?.score) ?? 0, 1)}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
