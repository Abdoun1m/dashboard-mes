import { KpiCard } from '../components/kpi/KpiCard';
import { Badge } from '../components/ui/badge';
import { ApiDiagnosticsPanel } from '../components/diagnostics/ApiDiagnosticsPanel';
import { useLiveData } from '../hooks/useLiveData';
import { getAlerts, getOverview } from '../services/mesService';
import { classifyStatus, formatAge, formatPct, safeNumber } from '../utils/format';

const STALE_AFTER_MS = 120_000;

const isStale = (sourceUpdatedAt: string | undefined): boolean => {
  if (!sourceUpdatedAt) return false;
  const ts = Date.parse(sourceUpdatedAt);
  if (!Number.isFinite(ts)) return false;
  return Date.now() - ts > STALE_AFTER_MS;
};

export const OverviewPage = () => {
  const overview = useLiveData(getOverview, 2500);
  const alerts = useLiveData(getAlerts, 4000);

  const source = overview.data?.source ?? 'unknown';
  const stale = isStale(overview.data?.sourceUpdatedAt);
  const lastUpdatedTs = overview.lastUpdated ? overview.lastUpdated.getTime() : null;
  const activeAlerts = safeNumber(overview.data?.activeAlerts) ?? safeNumber(alerts.data?.count) ?? 0;

  const actions = overview.data?.recommendedActions ?? [];
  const activeAlertList = alerts.data?.alerts ?? alerts.data?.active ?? [];

  return (
    <div className="space-y-6">
      {(overview.isFallback || alerts.isFallback) && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
          <Badge variant="warning" className="mb-2">Données estimées</Badge>
          <p className="text-xs text-amber-700 dark:text-amber-400">Le flux live API est indisponible, le dashboard affiche des données de repli.</p>
        </div>
      )}

      <section className="grid gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard
          label="Global MES Score"
          value={overview.data?.globalMesScore !== undefined ? formatPct(overview.data.globalMesScore, 1) : '—'}
          tone={classifyStatus(overview.data?.globalMesScore)}
          freshness={formatAge(lastUpdatedTs)}
          status="mes"
          source={source}
          isFallback={overview.isFallback}
          isStale={stale}
        />
        <KpiCard
          label="Factory OEE"
          value={overview.data?.factoryOee !== undefined ? formatPct(overview.data.factoryOee, 1) : '—'}
          tone={classifyStatus(overview.data?.factoryOee)}
          freshness={formatAge(lastUpdatedTs)}
          status="factory"
          source={source}
          isFallback={overview.isFallback}
          isStale={stale}
        />
        <KpiCard
          label="Power Reserve"
          value={overview.data?.powerReserve !== undefined ? overview.data.powerReserve.toFixed(1) : '—'}
          tone={overview.data?.powerReserve !== undefined && overview.data.powerReserve < 0 ? 'critical' : 'ok'}
          freshness={formatAge(lastUpdatedTs)}
          status="power"
          source={source}
          isFallback={overview.isFallback}
          isStale={stale}
        />
        <KpiCard
          label="Rail Safety"
          value={overview.data?.railSafety !== undefined ? formatPct(overview.data.railSafety, 1) : '—'}
          tone={classifyStatus(overview.data?.railSafety)}
          freshness={formatAge(lastUpdatedTs)}
          status="rail"
          source={source}
          isFallback={overview.isFallback}
          isStale={stale}
        />
        <KpiCard
          label="Active Alerts"
          value={String(activeAlerts)}
          tone={activeAlerts > 0 ? 'warning' : 'ok'}
          freshness={formatAge(alerts.lastUpdated ? alerts.lastUpdated.getTime() : null)}
          status="alerts"
          source={alerts.data?.source ?? source}
          isFallback={alerts.isFallback}
          isStale={isStale(alerts.data?.sourceUpdatedAt)}
        />
        <KpiCard
          label="Pipeline"
          value={overview.data?.pipelineStatus ?? overview.data?.pipeline?.status ?? '—'}
          tone={overview.data?.pipeline?.stale ? 'warning' : 'ok'}
          freshness={formatAge(lastUpdatedTs)}
          status="pipeline"
          source={source}
          isFallback={overview.isFallback}
          isStale={stale}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <div className="panel">
          <p className="panel-title">Recommended Actions</p>
          <ul className="mt-4 space-y-2 text-xs text-zinc-600 dark:text-zinc-300">
            {actions.length ? (
              actions.map((action) => (
                <li key={action} className="rounded-md border border-zinc-200/60 px-3 py-2 dark:border-zinc-800">
                  {action}
                </li>
              ))
            ) : (
              <li className="text-zinc-500">No recommended actions.</li>
            )}
          </ul>
        </div>
        <div className="panel">
          <p className="panel-title">Pipeline Status</p>
          <div className="mt-4 grid gap-2 text-xs text-zinc-600 dark:text-zinc-300">
            <div className="flex items-center justify-between rounded-md border border-zinc-200/60 px-3 py-2 dark:border-zinc-800">
              <span>Status</span>
              <span>{overview.data?.pipeline?.status ?? overview.data?.pipelineStatus ?? '—'}</span>
            </div>
            <div className="flex items-center justify-between rounded-md border border-zinc-200/60 px-3 py-2 dark:border-zinc-800">
              <span>Heartbeat</span>
              <span>{safeNumber(overview.data?.pipeline?.heartbeat) ?? '—'}</span>
            </div>
            <div className="flex items-center justify-between rounded-md border border-zinc-200/60 px-3 py-2 dark:border-zinc-800">
              <span>Stale</span>
              <span>{overview.data?.pipeline?.stale ? 'YES' : 'NO'}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="flex items-center justify-between">
          <p className="panel-title">Active Alerts</p>
          <span className="text-xs text-zinc-500">{activeAlertList.length} listed</span>
        </div>
        <div className="mt-3 space-y-2">
          {activeAlertList.length ? (
            activeAlertList.slice(0, 8).map((alert, index) => (
              <div
                key={`${alert.code ?? index}`}
                className="flex items-center justify-between rounded-md border border-zinc-200/60 px-3 py-2 text-xs dark:border-zinc-800"
              >
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">{alert.code ?? 'ALERT'}</p>
                  <p className="text-zinc-500 dark:text-zinc-400">{alert.message}</p>
                </div>
                <Badge variant={alert.severity === 'critical' ? 'critical' : 'warning'}>{alert.severity}</Badge>
              </div>
            ))
          ) : (
            <p className="text-xs text-zinc-500">No active alerts.</p>
          )}
        </div>
      </section>

      <ApiDiagnosticsPanel />
    </div>
  );
};
