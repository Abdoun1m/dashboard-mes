import { useQuery, type QueryKey } from '@tanstack/react-query';
import { fetchJson, type MesFetchMeta, type MesFetchResult } from '../api/mesClient';
import { getFreshnessStatus } from '../utils/format';

export interface MesQueryResult<T> {
  data: T | null;
  meta: MesFetchMeta | null;
  lastUpdated: number | null;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  freshness: 'fresh' | 'stale' | 'degraded';
}

interface MesQueryOptions {
  enabled?: boolean;
  refetchInterval?: number;
  staleAfterMs?: number;
}

export const useMesQuery = <T>(
  key: QueryKey,
  path: string,
  { enabled = true, refetchInterval = 2000, staleAfterMs = 12000 }: MesQueryOptions = {}
): MesQueryResult<T> => {
  const query = useQuery<MesFetchResult<T>>({
    queryKey: key,
    queryFn: () => fetchJson<T>(path),
    enabled,
    refetchInterval,
    retry: 2,
  retryDelay: (attempt: number) => Math.min(2000, 300 * (attempt + 1)),
    staleTime: staleAfterMs
  });

  const lastUpdated = query.data?.meta.checkedAt ?? (query.dataUpdatedAt ? query.dataUpdatedAt : null);

  return {
    data: query.data?.payload ?? null,
    meta: query.data?.meta ?? null,
    lastUpdated,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.data?.error ?? (query.error instanceof Error ? query.error.message : null),
    freshness: getFreshnessStatus(lastUpdated, staleAfterMs)
  };
};
