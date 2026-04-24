import { Activity, RefreshCw, ServerCog, ShieldCheck, Wifi, WifiOff } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useDataMode } from '../hooks/useDataMode';
import {
    getApiHealthReport,
    getRuntimeStatusSnapshot,
    type ApiEndpointHealth,
    type DataSourceMode
} from '../services/mesService';

const statusClass: Record<ApiEndpointHealth['status'], string> = {
  healthy: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200',
  degraded: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200',
  offline: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-200',
  mock: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-200',
  disabled: 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200'
};

const statusLabel: Record<ApiEndpointHealth['status'], string> = {
  healthy: 'Sain',
  degraded: 'Dégradé',
  offline: 'Hors ligne',
  mock: 'Mock',
  disabled: 'Désactivé'
};

export const AdminPage = () => {
  const { mode, setMode } = useDataMode();
  const [health, setHealth] = useState<ApiEndpointHealth[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const runtime = useMemo(() => getRuntimeStatusSnapshot(), [mode, lastRefresh]);

  const refresh = async () => {
    try {
      setError(null);
      const report = await getApiHealthReport();
      setHealth(report);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => {
      void refresh();
    }, 10000);
    return () => window.clearInterval(timer);
  }, [mode]);

  const setDataMode = (nextMode: DataSourceMode) => setMode(nextMode);

  const okCount = health.filter((item) => item.ok).length;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="glass-card">
          <p className="subtle-label">Mode de données</p>
          <p className="mt-3 text-2xl font-semibold">{mode === 'live' ? 'API Live' : 'Mock local'}</p>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setDataMode('live')}
              className={`rounded-xl px-3 py-2 text-xs font-semibold ${
                mode === 'live'
                  ? 'bg-brand-600 text-white'
                  : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200'
              }`}
            >
              API Live
            </button>
            <button
              onClick={() => setDataMode('mock')}
              className={`rounded-xl px-3 py-2 text-xs font-semibold ${
                mode === 'mock'
                  ? 'bg-brand-600 text-white'
                  : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200'
              }`}
            >
              Mock
            </button>
          </div>
        </article>

        <article className="glass-card">
          <p className="subtle-label">Connectivité</p>
          <p className="mt-3 inline-flex items-center gap-2 text-2xl font-semibold">
            {runtime.online ? <Wifi className="text-emerald-500" size={22} /> : <WifiOff className="text-rose-500" size={22} />}
            {runtime.online ? 'En ligne' : 'Hors ligne'}
          </p>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">État réseau navigateur</p>
        </article>

        <article className="glass-card">
          <p className="subtle-label">Santé API</p>
          <p className="mt-3 text-2xl font-semibold">
            {okCount}/{health.length || 5}
          </p>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Endpoints opérationnels</p>
        </article>

        <article className="glass-card">
          <p className="subtle-label">Configuration runtime</p>
          <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300">Base URL: {runtime.apiBaseUrl}</p>
          <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
            API activée: {runtime.apiEnabledByEnv ? 'Oui' : 'Non (VITE_DISABLE_API=1)'}
          </p>
        </article>
      </section>

      <section className="glass-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="subtle-label">Centre d'administration</p>
            <h2 className="mt-1 text-xl font-semibold">Supervision technique</h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Dernière vérification: {lastRefresh ? lastRefresh.toLocaleTimeString('fr-FR') : 'en attente'}
            </p>
          </div>
          <button
            onClick={() => void refresh()}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <RefreshCw size={15} />
            Rafraîchir
          </button>
        </div>

        <div className="mt-5 overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
            <thead className="bg-zinc-50 dark:bg-zinc-900/60">
              <tr className="text-left text-xs uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
                <th className="px-4 py-3">Endpoint</th>
                <th className="px-4 py-3">État</th>
                <th className="px-4 py-3">HTTP</th>
                <th className="px-4 py-3">Latence</th>
                <th className="px-4 py-3">Détail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-950/40">
              {health.map((row) => (
                <tr key={row.endpoint} className="text-sm text-zinc-700 dark:text-zinc-200">
                  <td className="px-4 py-3 font-medium">{row.endpoint}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusClass[row.status]}`}>
                      {statusLabel[row.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">{row.httpStatus ?? '-'}</td>
                  <td className="px-4 py-3">{row.latencyMs != null ? `${row.latencyMs} ms` : '-'}</td>
                  <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">{row.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {loading ? (
          <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">Initialisation de la supervision API...</p>
        ) : null}

        {error ? (
          <p className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-900/20 dark:text-rose-200">
            {error}
          </p>
        ) : null}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="glass-card">
          <p className="subtle-label">Actions admin</p>
          <p className="mt-2 inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
            <ServerCog size={16} />
            Bascule data source prod (API/Mock)
          </p>
        </article>
        <article className="glass-card">
          <p className="subtle-label">Observabilité</p>
          <p className="mt-2 inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
            <Activity size={16} />
            Polling santé endpoints toutes les 10s
          </p>
        </article>
        <article className="glass-card">
          <p className="subtle-label">Confiance opérationnelle</p>
          <p className="mt-2 inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
            <ShieldCheck size={16} />
            Fallback automatique en cas d'incident API
          </p>
        </article>
      </section>
    </div>
  );
};
