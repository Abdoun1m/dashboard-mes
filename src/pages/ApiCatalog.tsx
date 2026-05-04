import { DIAGNOSTIC_ENDPOINTS, MES_API_BASE_URL } from '../api/mesClient';
import { useMesQuery } from '../hooks/useMesQuery';

export const ApiCatalogPage = () => {
  const docs = useMesQuery<Record<string, unknown> | unknown[]>(['mes', 'docs'], '/api/mes/docs', { refetchInterval: 30000 });
  const catalog = useMesQuery<Record<string, unknown> | unknown[]>(['mes', 'catalog'], '/api/mes/kpi-catalog', { refetchInterval: 30000 });

  const docsItems = Array.isArray(docs.data) ? docs.data : (docs.data?.endpoints as Record<string, unknown>[] | undefined) ?? [];
  const catalogItems = Array.isArray(catalog.data) ? catalog.data : (catalog.data?.kpis as Record<string, unknown>[] | undefined) ?? [];

  return (
    <div className="space-y-6">
      <section className="panel">
        <p className="panel-title">API base URL</p>
        <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-200">{MES_API_BASE_URL}</p>
      </section>

      <section className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <div className="panel">
          <p className="panel-title">Validated endpoints</p>
          <div className="mt-3 overflow-auto">
            <table className="w-full text-xs">
              <thead className="text-left text-zinc-500 dark:text-zinc-400">
                <tr>
                  <th className="pb-2">Path</th>
                  <th className="pb-2">Label</th>
                </tr>
              </thead>
              <tbody>
                {DIAGNOSTIC_ENDPOINTS.map((endpoint) => (
                  <tr key={endpoint.key} className="border-t border-zinc-200/60 dark:border-zinc-800">
                    <td className="py-2">{endpoint.path}</td>
                    <td className="py-2">{endpoint.label}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="panel">
          <p className="panel-title">MES docs summary</p>
          <div className="mt-3 space-y-2 text-xs text-zinc-600 dark:text-zinc-300">
            {docsItems.length ? (
              docsItems.slice(0, 8).map((item, index) => (
                <div key={index} className="rounded-md border border-zinc-200/60 px-3 py-2 dark:border-zinc-800">
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {String((item as Record<string, unknown>).name ?? (item as Record<string, unknown>).path ?? `Doc ${index + 1}`)}
                  </p>
                  <p className="text-zinc-500 dark:text-zinc-400">
                    {String((item as Record<string, unknown>).description ?? '—')}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-zinc-500">No docs available.</p>
            )}
          </div>
        </div>
      </section>

      <section className="panel">
        <p className="panel-title">KPI catalog</p>
        <div className="mt-3 overflow-auto">
          <table className="w-full text-xs">
            <thead className="text-left text-zinc-500 dark:text-zinc-400">
              <tr>
                <th className="pb-2">KPI</th>
                <th className="pb-2">Unit</th>
                <th className="pb-2">Description</th>
              </tr>
            </thead>
            <tbody>
              {catalogItems.length ? (
                catalogItems.map((item, index) => (
                  <tr key={index} className="border-t border-zinc-200/60 dark:border-zinc-800">
                    <td className="py-2">{String((item as Record<string, unknown>).name ?? (item as Record<string, unknown>).kpi ?? `KPI ${index + 1}`)}</td>
                    <td className="py-2">{String((item as Record<string, unknown>).unit ?? '—')}</td>
                    <td className="py-2">{String((item as Record<string, unknown>).description ?? '—')}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="py-3 text-zinc-500" colSpan={3}>
                    No KPI catalog available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
