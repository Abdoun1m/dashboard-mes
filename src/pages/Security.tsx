import { KpiCard } from '../components/kpi/KpiCard';
import { Badge } from '../components/ui/badge';
import { StatusPill } from '../components/kpi/StatusPill';
import { FreshnessSparkline } from '../components/charts/FreshnessSparkline';
import { useMesQuery } from '../hooks/useMesQuery';
import { classifyStatus, formatAge, safeNumber } from '../utils/format';
import type { MesAlert } from '../types/mes';

export const SecurityPage = () => {
  const qa = useMesQuery<Record<string, unknown> | unknown[]>(['mes', 'qa'], '/api/mes/qa');
  const alerts = useMesQuery<{ alerts?: MesAlert[] }>(['mes', 'alerts'], '/api/mes/alerts');
  const freshness = useMesQuery<Record<string, unknown> | unknown[]>(['mes', 'freshness'], '/api/mes/freshness');
  const cyberRange = useMesQuery<Record<string, unknown>>(['mes', 'cyber-range'], '/api/mes/cyber-range-status');
  const health = useMesQuery<Record<string, unknown>>(['mes', 'health'], '/api/mes/health');

  const qaRows = Array.isArray(qa.data) ? qa.data : (qa.data?.checks as Record<string, unknown>[] | undefined) ?? [];
  const alertRows = alerts.data?.alerts ?? [];
  const freshnessSeries = Array.isArray(freshness.data)
    ? freshness.data.map((point, index) => ({
        timestamp: String((point as Record<string, unknown>).timestamp ?? index + 1),
        value: safeNumber((point as Record<string, unknown>).value) ?? 0
      }))
    : [];

  const integrityScore = safeNumber(health.data?.integrity ?? health.data?.score) ?? null;
  
  const hasError = qa.isError || alerts.isError || freshness.isError || cyberRange.isError || health.isError;

  return (
    <div className="space-y-6">
      {hasError && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
          <Badge variant="warning" className="mb-2">Données dégradées</Badge>
          <p className="text-xs text-amber-700 dark:text-amber-400">Certaines données de sécurité sont indisponibles - seules les informations accessibles sont affichées.</p>
        </div>
      )}
      <section className="grid gap-4 lg:grid-cols-3">
        <KpiCard
          label="Integrity score"
          value={integrityScore !== null ? `${integrityScore.toFixed(1)}%` : '—'}
          tone={classifyStatus(integrityScore)}
          freshness={formatAge(health.lastUpdated)}
          status={health.freshness}
          helper="Cross-domain integrity checks"
        />
        <KpiCard
          label="Cyber-range status"
          value={String(cyberRange.data?.status ?? cyberRange.data?.state ?? '—')}
          tone={cyberRange.data?.status === 'degraded' ? 'warning' : 'ok'}
          freshness={formatAge(cyberRange.lastUpdated)}
          status={cyberRange.freshness}
          helper="Attack surface monitoring"
        />
        <KpiCard
          label="Alert volume"
          value={String(alertRows.length)}
          tone={alertRows.some((alert) => alert.severity === 'critical') ? 'critical' : 'warning'}
          freshness={formatAge(alerts.lastUpdated)}
          status={alerts.freshness}
          helper="Criticality-ranked alerts"
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <div className="panel">
          <p className="panel-title">Integrity checks</p>
          <div className="mt-3 overflow-auto">
            <table className="w-full text-xs">
              <thead className="text-left text-zinc-500 dark:text-zinc-400">
                <tr>
                  <th className="pb-2">Check</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Detail</th>
                </tr>
              </thead>
              <tbody>
                {qaRows.length ? (
                  qaRows.map((row, index) => (
                    <tr key={index} className="border-t border-zinc-200/60 dark:border-zinc-800">
                      <td className="py-2">{String((row as Record<string, unknown>).name ?? (row as Record<string, unknown>).check ?? `Check ${index + 1}`)}</td>
                      <td className="py-2">
                        <StatusPill
                          label="status"
                          value={String((row as Record<string, unknown>).status ?? 'unknown')}
                          tone={(row as Record<string, unknown>).status === 'fail' ? 'critical' : 'ok'}
                        />
                      </td>
                      <td className="py-2">{String((row as Record<string, unknown>).detail ?? (row as Record<string, unknown>).message ?? '—')}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-3 text-zinc-500" colSpan={3}>
                      No integrity checks reported.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel">
          <p className="panel-title">Pipeline freshness</p>
          <FreshnessSparkline data={freshnessSeries} />
          <div className="mt-3 space-y-2 text-xs text-zinc-600 dark:text-zinc-300">
            <div className="flex items-center justify-between rounded-md border border-zinc-200/60 px-3 py-2 dark:border-zinc-800">
              <span>Freshness status</span>
              <span>{freshness.freshness}</span>
            </div>
            <div className="flex items-center justify-between rounded-md border border-zinc-200/60 px-3 py-2 dark:border-zinc-800">
              <span>Last update</span>
              <span>{formatAge(freshness.lastUpdated)}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="panel">
        <p className="panel-title">Alert center</p>
        <div className="mt-3 space-y-2 text-xs">
          {alertRows.length ? (
            alertRows.map((alert, index) => (
              <div key={index} className="flex items-center justify-between rounded-md border border-zinc-200/60 px-3 py-2 dark:border-zinc-800">
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">{alert.code ?? 'ALERT'}</p>
                  <p className="text-zinc-500 dark:text-zinc-400">{alert.message}</p>
                </div>
                <StatusPill label="severity" value={alert.severity} tone={alert.severity === 'critical' ? 'critical' : 'warning'} />
              </div>
            ))
          ) : (
            <p className="text-zinc-500">No active alerts.</p>
          )}
        </div>
      </section>
    </div>
  );
};
