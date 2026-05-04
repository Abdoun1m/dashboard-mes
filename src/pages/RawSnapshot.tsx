import { useMemo, useState, type ChangeEvent } from 'react';
import { Badge } from '../components/ui/badge';
import { useMesQuery } from '../hooks/useMesQuery';

export const RawSnapshotPage = () => {
  const snapshot = useMesQuery<Record<string, unknown>>(['mes', 'raw'], '/api/mes/raw-snapshot');
  const [query, setQuery] = useState('');

  const rows = useMemo(() => {
    if (!snapshot.data) return [] as Array<{ key: string; value: string }>;
    if (Array.isArray(snapshot.data)) {
      return snapshot.data.map((row, index) => ({
        key: String((row as Record<string, unknown>).key ?? (row as Record<string, unknown>).tag ?? `tag-${index + 1}`),
        value: String((row as Record<string, unknown>).value ?? '—')
      }));
    }
    return Object.entries(snapshot.data).map(([key, value]) => ({ key, value: String(value) }));
  }, [snapshot.data]);

  const filteredRows = rows.filter((row: { key: string }) => row.key.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="space-y-4">
      {snapshot.isError && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
          <Badge variant="warning" className="mb-2">Données dégradées</Badge>
          <p className="text-xs text-amber-700 dark:text-amber-400">L'instantané de télémétrie brute est indisponible.</p>
        </div>
      )}
      <div className="panel">
        <div className="flex items-center justify-between">
          <p className="panel-title">Raw telemetry snapshot</p>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">{filteredRows.length} tags</span>
        </div>
        <div className="mt-4">
          <input
            value={query}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setQuery(event.target.value)}
            placeholder="Search tag or signal..."
            className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>
        <div className="mt-4 overflow-auto">
          <table className="w-full text-xs">
            <thead className="text-left text-zinc-500 dark:text-zinc-400">
              <tr>
                <th className="pb-2">Tag</th>
                <th className="pb-2">Value</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length ? (
                filteredRows.map((row) => (
                  <tr key={row.key} className="border-t border-zinc-200/60 dark:border-zinc-800">
                    <td className="py-2 font-semibold text-zinc-900 dark:text-zinc-100">{row.key}</td>
                    <td className="py-2 text-zinc-600 dark:text-zinc-300">{row.value}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="py-3 text-zinc-500" colSpan={2}>
                    No telemetry rows found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
