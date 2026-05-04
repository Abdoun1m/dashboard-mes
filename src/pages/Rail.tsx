import { KpiCard } from '../components/kpi/KpiCard';
import { StatusPill } from '../components/kpi/StatusPill';
import { Gauge } from '../components/charts/Gauge';
import { ThroughputChart } from '../components/charts/ThroughputChart';
import { useMesQuery } from '../hooks/useMesQuery';
import { classifyStatus, formatAge, formatPct, safeNumber } from '../utils/format';

export const RailPage = () => {
  const progress = useMesQuery<Record<string, unknown> | unknown[]>(['rail', 'progress'], '/api/rail/auto-progress');
  const manualRoutes = useMesQuery<Record<string, unknown> | unknown[]>(['rail', 'manualRoutes'], '/api/rail/routes');
  const conflicts = useMesQuery<Record<string, unknown> | unknown[]>(['rail', 'conflicts'], '/api/rail/conflicts');
  const throughput = useMesQuery<Record<string, unknown> | unknown[]>(['rail', 'throughput'], '/api/rail/throughput');
  const safetyScore = useMesQuery<Record<string, unknown>>(['rail', 'safety'], '/api/rail/safety-score');
  const routingScore = useMesQuery<Record<string, unknown>>(['rail', 'routing'], '/api/rail/routing-score');
  const globalFault = useMesQuery<Record<string, unknown>>(['rail', 'fault'], '/api/rail/global-fault');
  const completion = useMesQuery<Record<string, unknown>>(['rail', 'completion'], '/api/rail/completion');

  const safetyValue = safeNumber(safetyScore.data?.score ?? safetyScore.data?.value) ?? null;
  const routingValue = safeNumber(routingScore.data?.score ?? routingScore.data?.value) ?? null;
  const faultValue = globalFault.data?.fault ?? globalFault.data?.status ?? null;

  const throughputSeries = Array.isArray(throughput.data)
    ? throughput.data.map((point, index) => ({
        timestamp: String((point as Record<string, unknown>).timestamp ?? index + 1),
        value: safeNumber((point as Record<string, unknown>).value) ?? 0
      }))
    : [];

  const progressRows = Array.isArray(progress.data) ? progress.data : (progress.data?.rows as Record<string, unknown>[] | undefined) ?? [];
  const manualRows = Array.isArray(manualRoutes.data) ? manualRoutes.data : (manualRoutes.data?.rows as Record<string, unknown>[] | undefined) ?? [];
  const conflictRows = Array.isArray(conflicts.data) ? conflicts.data : (conflicts.data?.rows as Record<string, unknown>[] | undefined) ?? [];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-4">
        <KpiCard
          label="Safety score"
          value={safetyValue !== null ? formatPct(safetyValue, 1) : '—'}
          tone={classifyStatus(safetyValue)}
          freshness={formatAge(safetyScore.lastUpdated)}
          status={safetyScore.freshness}
          helper="Interlocking safety"
        />
        <KpiCard
          label="Routing score"
          value={routingValue !== null ? formatPct(routingValue, 1) : '—'}
          tone={classifyStatus(routingValue)}
          freshness={formatAge(routingScore.lastUpdated)}
          status={routingScore.freshness}
          helper="Route efficiency"
        />
        <KpiCard
          label="Global fault"
          value={faultValue ? 'ACTIVE' : 'CLEAR'}
          tone={faultValue ? 'critical' : 'ok'}
          freshness={formatAge(globalFault.lastUpdated)}
          status={faultValue ? 'critical' : 'ok'}
          helper="System fault latch"
        />
        <KpiCard
          label="Completion"
          value={safeNumber(completion.data?.count ?? completion.data?.value) ? String(completion.data?.count ?? completion.data?.value) : '—'}
          tone="info"
          freshness={formatAge(completion.lastUpdated)}
          status={completion.freshness}
          helper="Completed routes"
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <div className="panel">
          <p className="panel-title">Auto step progress timeline</p>
          <div className="mt-3 overflow-auto">
            <table className="w-full text-xs">
              <thead className="text-left text-zinc-500 dark:text-zinc-400">
                <tr>
                  <th className="pb-2">Step</th>
                  <th className="pb-2">State</th>
                  <th className="pb-2">Progress</th>
                </tr>
              </thead>
              <tbody>
                {progressRows.length ? (
                  progressRows.map((row, index) => (
                    <tr key={index} className="border-t border-zinc-200/60 dark:border-zinc-800">
                      <td className="py-2">{String((row as Record<string, unknown>).step ?? index + 1)}</td>
                      <td className="py-2">{String((row as Record<string, unknown>).state ?? '—')}</td>
                      <td className="py-2">{safeNumber((row as Record<string, unknown>).progress) ?? '—'}%</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-3 text-zinc-500" colSpan={3}>
                      No auto progress data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="panel space-y-4">
          <Gauge value={safetyValue ?? 0} label="Safety" unit="%" tone={classifyStatus(safetyValue)} />
          <Gauge value={routingValue ?? 0} label="Routing" unit="%" tone={classifyStatus(routingValue)} />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <div className="panel">
          <p className="panel-title">Manual route state matrix</p>
          <div className="mt-3 overflow-auto">
            <table className="w-full text-xs">
              <thead className="text-left text-zinc-500 dark:text-zinc-400">
                <tr>
                  <th className="pb-2">Route</th>
                  <th className="pb-2">State</th>
                  <th className="pb-2">Direction</th>
                </tr>
              </thead>
              <tbody>
                {manualRows.length ? (
                  manualRows.map((row, index) => (
                    <tr key={index} className="border-t border-zinc-200/60 dark:border-zinc-800">
                      <td className="py-2">{String((row as Record<string, unknown>).route ?? `R-${index + 1}`)}</td>
                      <td className="py-2">{String((row as Record<string, unknown>).state ?? '—')}</td>
                      <td className="py-2">{String((row as Record<string, unknown>).direction ?? '—')}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-3 text-zinc-500" colSpan={3}>
                      No manual route states available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="panel">
          <p className="panel-title">Route conflicts</p>
          <div className="mt-3 space-y-2 text-xs">
            {conflictRows.length ? (
              conflictRows.map((row, index) => (
                <div key={index} className="flex items-center justify-between rounded-md border border-zinc-200/60 px-3 py-2 dark:border-zinc-800">
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {String((row as Record<string, unknown>).route ?? (row as Record<string, unknown>).id ?? `Conflict ${index + 1}`)}
                    </p>
                    <p className="text-zinc-500 dark:text-zinc-400">
                      {String((row as Record<string, unknown>).detail ?? (row as Record<string, unknown>).message ?? '—')}
                    </p>
                  </div>
                  <StatusPill
                    label="conflict"
                    value={String((row as Record<string, unknown>).direction ?? 'route')}
                    tone={(row as Record<string, unknown>).directionConflict ? 'critical' : 'warning'}
                  />
                </div>
              ))
            ) : (
              <p className="text-zinc-500">No conflicts reported.</p>
            )}
          </div>
        </div>
      </section>

      <section className="panel">
        <p className="panel-title">Throughput</p>
        <ThroughputChart data={throughputSeries} />
      </section>
    </div>
  );
};
