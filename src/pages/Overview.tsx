import { KpiCard } from '../components/kpi/KpiCard';
import { Badge } from '../components/ui/badge';
import { StatusPill } from '../components/kpi/StatusPill';
import { ApiDiagnosticsPanel } from '../components/diagnostics/ApiDiagnosticsPanel';
import { useMesQuery } from '../hooks/useMesQuery';
import { classifyStatus, formatAge, formatPct, num, safeNumber } from '../utils/format';
import type { MesAlert } from '../types/mes';

const pickNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const pickFrom = (source: Record<string, unknown> | null, keys: string[]): number | null => {
  if (!source) return null;
  for (const key of keys) {
    const value = pickNumber(source[key]);
    if (value !== null) return value;
  }
  return null;
};

export const OverviewPage = () => {
  const overview = useMesQuery<Record<string, unknown>>(['mes', 'overview'], '/api/overview');
  const executive = useMesQuery<Record<string, unknown>>(['mes', 'executive'], '/api/mes/executive-score');
  const operational = useMesQuery<Record<string, unknown>>(['mes', 'operational'], '/api/mes/operational-score');
  const availability = useMesQuery<Record<string, unknown>>(['mes', 'availability'], '/api/mes/global-availability');
  const risk = useMesQuery<Record<string, unknown>>(['mes', 'risk'], '/api/mes/global-risk');
  const actions = useMesQuery<Record<string, unknown>>(['mes', 'actions'], '/api/mes/recommended-actions');
  const timeline = useMesQuery<Record<string, unknown>>(['mes', 'timeline'], '/api/mes/timeline-state');
  const alerts = useMesQuery<{ alerts?: MesAlert[] }>(['mes', 'alerts'], '/api/mes/alerts');

  const executiveScore = pickFrom(executive.data, ['score', 'executiveScore', 'value']) ??
    pickFrom(overview.data, ['executiveScore', 'executive_score']);
  const operationalScore = pickFrom(operational.data, ['score', 'operationalScore', 'value']) ??
    pickFrom(overview.data, ['operationalScore', 'operational_score']);
  const availabilityScore = pickFrom(availability.data, ['availability', 'score', 'value']) ??
    pickFrom(overview.data, ['globalAvailability', 'availability']);
  const riskScore = pickFrom(risk.data, ['risk', 'score', 'value']) ?? pickFrom(overview.data, ['globalRisk', 'risk']);

  const recommended = (actions.data?.actions as string[] | undefined) ??
    (actions.data?.recommendedActions as string[] | undefined) ??
    (overview.data?.recommendedActions as string[] | undefined) ??
    [];

  const timelineState = (timeline.data?.state as string | undefined) ??
    (overview.data?.timelineState as string | undefined) ??
    '—';

  const alertItems = alerts.data?.alerts ?? [];
  
  const hasError = overview.isError || executive.isError || operational.isError || availability.isError || 
    risk.isError || actions.isError || timeline.isError || alerts.isError;

  return (
    <div className="space-y-6">
      {hasError && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
          <Badge variant="warning" className="mb-2">Données dégradées</Badge>
          <p className="text-xs text-amber-700 dark:text-amber-400">Certaines données d'aperçu sont indisponibles - seules les informations accessibles sont affichées.</p>
        </div>
      )}
      <section className="grid gap-4 lg:grid-cols-4">
        <KpiCard
          label="Executive score"
          value={executiveScore !== null ? num(executiveScore) : '—'}
          unit="%"
          tone={classifyStatus(executiveScore)}
          freshness={formatAge(executive.lastUpdated)}
          status={executive.freshness}
          helper="Board-level operational readiness"
        />
        <KpiCard
          label="Operational score"
          value={operationalScore !== null ? num(operationalScore) : '—'}
          unit="%"
          tone={classifyStatus(operationalScore)}
          freshness={formatAge(operational.lastUpdated)}
          status={operational.freshness}
          helper="MES execution health"
        />
        <KpiCard
          label="Global availability"
          value={availabilityScore !== null ? formatPct(availabilityScore, 1) : '—'}
          tone={classifyStatus(availabilityScore)}
          freshness={formatAge(availability.lastUpdated)}
          status={availability.freshness}
          helper="System availability index"
        />
        <KpiCard
          label="Global risk"
          value={riskScore !== null ? formatPct(riskScore, 1) : '—'}
          tone={riskScore !== null && riskScore > 60 ? 'critical' : 'warning'}
          freshness={formatAge(risk.lastUpdated)}
          status={risk.freshness}
          helper="Aggregated cyber + OT risk"
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <div className="panel">
          <div className="flex items-center justify-between">
            <p className="panel-title">Operational timeline</p>
            <StatusPill label="state" value={timelineState} tone="info" />
          </div>
          <div className="mt-4 grid gap-3 text-xs text-zinc-600 dark:text-zinc-300">
            <div className="flex items-center justify-between border-b border-dashed border-zinc-200 pb-2 dark:border-zinc-800">
              <span>Timeline state</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">{timelineState}</span>
            </div>
            <div className="flex items-center justify-between border-b border-dashed border-zinc-200 pb-2 dark:border-zinc-800">
              <span>Last sync</span>
              <span>{formatAge(overview.lastUpdated)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Data integrity</span>
              <span className="font-semibold">{overview.freshness}</span>
            </div>
          </div>
        </div>

        <div className="panel">
          <p className="panel-title">Recommended actions</p>
          <ul className="mt-4 space-y-2 text-xs text-zinc-600 dark:text-zinc-300">
            {recommended.length ? (
              recommended.map((action) => (
                <li key={action} className="rounded-md border border-zinc-200/60 px-3 py-2 dark:border-zinc-800">
                  {action}
                </li>
              ))
            ) : (
              <li className="text-zinc-500">No actions reported.</li>
            )}
          </ul>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <div className="panel">
          <div className="flex items-center justify-between">
            <p className="panel-title">Alert center</p>
            <span className="text-xs text-zinc-500">{alertItems.length} active</span>
          </div>
          <div className="mt-3 space-y-2">
            {alertItems.length ? (
              alertItems.slice(0, 6).map((alert, index) => (
                <div
                  key={`${alert.code ?? index}`}
                  className="flex items-center justify-between rounded-md border border-zinc-200/60 px-3 py-2 text-xs dark:border-zinc-800"
                >
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">{alert.code ?? 'ALERT'}</p>
                    <p className="text-zinc-500 dark:text-zinc-400">{alert.message}</p>
                  </div>
                  <StatusPill label="severity" value={alert.severity} tone={alert.severity === 'critical' ? 'critical' : 'warning'} />
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-500">No active alerts.</p>
            )}
          </div>
        </div>

        <div className="panel">
          <p className="panel-title">System map (summary)</p>
          <div className="mt-4 grid gap-2 text-xs text-zinc-600 dark:text-zinc-300">
            <div className="flex items-center justify-between rounded-md border border-zinc-200/60 px-3 py-2 dark:border-zinc-800">
              <span>Nodes</span>
              <span>{safeNumber((overview.data?.nodes as number) ?? (overview.data?.nodeCount as number)) ?? '—'}</span>
            </div>
            <div className="flex items-center justify-between rounded-md border border-zinc-200/60 px-3 py-2 dark:border-zinc-800">
              <span>Links</span>
              <span>{safeNumber((overview.data?.links as number) ?? (overview.data?.linkCount as number)) ?? '—'}</span>
            </div>
            <div className="flex items-center justify-between rounded-md border border-zinc-200/60 px-3 py-2 dark:border-zinc-800">
              <span>Pipeline</span>
              <span>{overview.data?.pipelineStatus ? String(overview.data?.pipelineStatus) : '—'}</span>
            </div>
          </div>
        </div>
      </section>

      <ApiDiagnosticsPanel />
    </div>
  );
};
