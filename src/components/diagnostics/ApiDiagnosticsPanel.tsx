import { useQueries } from '@tanstack/react-query';
import { DIAGNOSTIC_ENDPOINTS } from '../../api/mesClient';
import { formatAge } from '../../utils/format';
import { runApiSmokeTest } from '../../utils/apiDiagnostics';

export const ApiDiagnosticsPanel = () => {
  const results = useQueries({
    queries: DIAGNOSTIC_ENDPOINTS.map((endpoint) => ({
      queryKey: ['diagnostic', endpoint.key],
  queryFn: () => runApiSmokeTest<Record<string, unknown>>(endpoint.path),
      refetchInterval: 30000,
      retry: 1,
      staleTime: 30000
    }))
  });

  return (
    <div className="panel">
      <div className="flex items-center justify-between">
        <p className="panel-title">API Diagnostics</p>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">Polling 30s</span>
      </div>
      <div className="mt-4 overflow-auto">
        <table className="w-full text-xs">
          <thead className="text-left text-zinc-500 dark:text-zinc-400">
            <tr>
              <th className="pb-2">Endpoint</th>
              <th className="pb-2">Status</th>
              <th className="pb-2">Latency</th>
              <th className="pb-2">Last success</th>
            </tr>
          </thead>
          <tbody className="text-zinc-700 dark:text-zinc-200">
            {DIAGNOSTIC_ENDPOINTS.map((endpoint, index) => {
              const result = results[index];
              const payload = result.data;
              const ok = payload?.meta.ok ?? false;
              return (
                <tr key={endpoint.key} className="border-t border-zinc-200/60 dark:border-zinc-800">
                  <td className="py-2 pr-3">{endpoint.path}</td>
                  <td className={`py-2 pr-3 ${ok ? 'text-emerald-600' : 'text-amber-500'}`}>
                    {ok ? 'OK' : 'FAIL'}
                  </td>
                  <td className="py-2 pr-3">{payload?.meta.responseTimeMs ?? '—'} ms</td>
                  <td className="py-2">{formatAge(payload?.meta.checkedAt ?? null)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
