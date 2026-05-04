import { KpiCard } from '../components/kpi/KpiCard';
import { Gauge } from '../components/charts/Gauge';
import { ProcessScoreRadial } from '../components/charts/ProcessScoreRadial';
import { ScoreTimelineChart } from '../components/charts/ScoreTimelineChart';
import { useMesQuery } from '../hooks/useMesQuery';
import { classifyStatus, formatAge, formatPct, safeNumber } from '../utils/format';
import type { MesAlert } from '../types/mes';

export const FactoryPage = () => {
  const overview = useMesQuery<Record<string, unknown>>(['factory', 'overview'], '/api/factory/overview');
  const stateTimeline = useMesQuery<Record<string, unknown> | unknown[]>(['factory', 'state'], '/api/factory/state');
  const cycleTimeline = useMesQuery<Record<string, unknown> | unknown[]>(['factory', 'cycle'], '/api/factory/cycle');
  const tankShadow = useMesQuery<Record<string, unknown> | unknown[]>(['factory', 'tankShadow'], '/api/factory/tanks-shadow');
  const bottling = useMesQuery<Record<string, unknown>>(['factory', 'bottling'], '/api/factory/bottling-readiness');
  const processScore = useMesQuery<Record<string, unknown>>(['factory', 'processScore'], '/api/factory/process-score');
  const operationalRisk = useMesQuery<Record<string, unknown>>(['factory', 'risk'], '/api/factory/operational-risk');
  const availability = useMesQuery<Record<string, unknown>>(['factory', 'availability'], '/api/factory/availability');
  const alarms = useMesQuery<{ alarms?: MesAlert[] }>(['factory', 'alarms'], '/api/factory/alarms');
  const recycle = useMesQuery<Record<string, unknown>>(['factory', 'recycle'], '/api/factory/recycle');

  const processScoreValue = safeNumber(processScore.data?.score ?? processScore.data?.value) ?? null;
  const riskValue = safeNumber(operationalRisk.data?.risk ?? operationalRisk.data?.value) ?? null;
  const availabilityValue = safeNumber(availability.data?.availability ?? availability.data?.value) ?? null;
  const bottlingValue = safeNumber(bottling.data?.readiness ?? bottling.data?.value) ?? null;

  const timelineRows = Array.isArray(stateTimeline.data) ? stateTimeline.data : (stateTimeline.data?.rows as Record<string, unknown>[] | undefined) ?? [];
  const cycleRows = Array.isArray(cycleTimeline.data) ? cycleTimeline.data : (cycleTimeline.data?.rows as Record<string, unknown>[] | undefined) ?? [];
  const tankRows = Array.isArray(tankShadow.data) ? tankShadow.data : (tankShadow.data?.rows as Record<string, unknown>[] | undefined) ?? [];
  const alarmRows = alarms.data?.alarms ?? [];

  const riskSeries = Array.isArray(operationalRisk.data)
    ? operationalRisk.data.map((point, index) => ({
        timestamp: String((point as Record<string, unknown>).timestamp ?? index + 1),
        value: safeNumber((point as Record<string, unknown>).value) ?? 0
      }))
    : [];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-4">
        <KpiCard
          label="Availability"
          value={availabilityValue !== null ? formatPct(availabilityValue, 1) : '—'}
          tone={classifyStatus(availabilityValue)}
          freshness={formatAge(availability.lastUpdated)}
          status={availability.freshness}
          helper="Plant uptime"
        />
        <KpiCard
          label="Process score"
          value={processScoreValue !== null ? formatPct(processScoreValue, 1) : '—'}
          tone={classifyStatus(processScoreValue)}
          freshness={formatAge(processScore.lastUpdated)}
          status={processScore.freshness}
          helper="Process consistency"
        />
        <KpiCard
          label="Operational risk"
          value={riskValue !== null ? formatPct(riskValue, 1) : '—'}
          tone={riskValue !== null && riskValue > 60 ? 'critical' : 'warning'}
          freshness={formatAge(operationalRisk.lastUpdated)}
          status={operationalRisk.freshness}
          helper="Failure potential"
        />
        <KpiCard
          label="Bottling readiness"
          value={bottlingValue !== null ? formatPct(bottlingValue, 1) : '—'}
          tone={classifyStatus(bottlingValue)}
          freshness={formatAge(bottling.lastUpdated)}
          status={bottling.freshness}
          helper="Line readiness"
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <div className="panel">
          <p className="panel-title">Factory state timeline</p>
          <div className="mt-3 overflow-auto">
            <table className="w-full text-xs">
              <thead className="text-left text-zinc-500 dark:text-zinc-400">
                <tr>
                  <th className="pb-2">Time</th>
                  <th className="pb-2">State</th>
                  <th className="pb-2">Notes</th>
                </tr>
              </thead>
              <tbody>
                {timelineRows.length ? (
                  timelineRows.map((row, index) => (
                    <tr key={index} className="border-t border-zinc-200/60 dark:border-zinc-800">
                      <td className="py-2">{String((row as Record<string, unknown>).timestamp ?? (row as Record<string, unknown>).time ?? '—')}</td>
                      <td className="py-2">{String((row as Record<string, unknown>).state ?? (row as Record<string, unknown>).status ?? '—')}</td>
                      <td className="py-2">{String((row as Record<string, unknown>).note ?? '—')}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-3 text-zinc-500" colSpan={3}>
                      No state timeline available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="panel space-y-4">
          <ProcessScoreRadial value={processScoreValue ?? 0} />
          <Gauge value={bottlingValue ?? 0} label="Bottling readiness" unit="%" tone={classifyStatus(bottlingValue)} />
        </div>
      </section>

      <section className="panel">
        <p className="panel-title">Operational risk trend</p>
        <ScoreTimelineChart data={riskSeries} color="#f97316" />
      </section>

      <section className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <div className="panel">
          <p className="panel-title">Cycle state timeline</p>
          <div className="mt-3 overflow-auto">
            <table className="w-full text-xs">
              <thead className="text-left text-zinc-500 dark:text-zinc-400">
                <tr>
                  <th className="pb-2">Cycle</th>
                  <th className="pb-2">State</th>
                  <th className="pb-2">Progress</th>
                </tr>
              </thead>
              <tbody>
                {cycleRows.length ? (
                  cycleRows.map((row, index) => (
                    <tr key={index} className="border-t border-zinc-200/60 dark:border-zinc-800">
                      <td className="py-2">{String((row as Record<string, unknown>).cycle ?? (row as Record<string, unknown>).id ?? index + 1)}</td>
                      <td className="py-2">{String((row as Record<string, unknown>).state ?? '—')}</td>
                      <td className="py-2">{safeNumber((row as Record<string, unknown>).progress) ?? '—'}%</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-3 text-zinc-500" colSpan={3}>
                      No cycle data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel">
          <p className="panel-title">Recycle status</p>
          <div className="mt-3 space-y-2 text-xs text-zinc-600 dark:text-zinc-300">
            <div className="flex items-center justify-between rounded-md border border-zinc-200/60 px-3 py-2 dark:border-zinc-800">
              <span>Status</span>
              <span className="font-semibold">{String(recycle.data?.status ?? recycle.data?.state ?? '—')}</span>
            </div>
            <div className="flex items-center justify-between rounded-md border border-zinc-200/60 px-3 py-2 dark:border-zinc-800">
              <span>Rate</span>
              <span>{safeNumber(recycle.data?.rate) ?? '—'}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <div className="panel">
          <p className="panel-title">Tank shadow matrix</p>
          <div className="mt-3 overflow-auto">
            <table className="w-full text-xs">
              <thead className="text-left text-zinc-500 dark:text-zinc-400">
                <tr>
                  <th className="pb-2">Tank</th>
                  <th className="pb-2">Low</th>
                  <th className="pb-2">High</th>
                </tr>
              </thead>
              <tbody>
                {tankRows.length ? (
                  tankRows.map((row, index) => (
                    <tr key={index} className="border-t border-zinc-200/60 dark:border-zinc-800">
                      <td className="py-2">{String((row as Record<string, unknown>).tank ?? (row as Record<string, unknown>).id ?? `T-${index + 1}`)}</td>
                      <td className="py-2">{safeNumber((row as Record<string, unknown>).low) ?? '—'}</td>
                      <td className="py-2">{safeNumber((row as Record<string, unknown>).high) ?? '—'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-3 text-zinc-500" colSpan={3}>
                      No tank shadow data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel">
          <p className="panel-title">Alarm table</p>
          <div className="mt-3 space-y-2 text-xs">
            {alarmRows.length ? (
              alarmRows.slice(0, 6).map((alarm, index) => (
                <div key={index} className="rounded-md border border-zinc-200/60 px-3 py-2 dark:border-zinc-800">
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">{alarm.code ?? 'ALARM'}</p>
                  <p className="text-zinc-500 dark:text-zinc-400">{alarm.message}</p>
                </div>
              ))
            ) : (
              <p className="text-zinc-500">No active alarms.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
