import { useCallback, useEffect, useState } from 'react';

interface LiveState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  isFallback: boolean;
  refresh: () => Promise<void>;
}

export const useLiveData = <T>(loader: () => Promise<T>, refreshMs = 6000): LiveState<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isFallback, setIsFallback] = useState<boolean>(false);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const next = await loader();
      setData(next);
      setLastUpdated(new Date());
      const nextRecord = next as Record<string, unknown>;
      const fallbackFlag = nextRecord?.fallback;
      const legacyFallbackFlag = nextRecord?._isFallback;
      setIsFallback((fallbackFlag === true) || (legacyFallbackFlag === true));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      setIsFallback(true);
    } finally {
      setLoading(false);
    }
  }, [loader]);

  useEffect(() => {
    void refresh();
    const interval = window.setInterval(() => {
      void refresh();
    }, refreshMs);
    return () => window.clearInterval(interval);
  }, [refresh, refreshMs]);

  return { data, loading, error, lastUpdated, isFallback, refresh };
};
