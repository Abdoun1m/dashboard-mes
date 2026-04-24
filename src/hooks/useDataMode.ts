import { useEffect, useMemo, useState } from 'react';
import {
    getDataSourceMode,
    setDataSourceMode,
    subscribeDataSourceMode,
    type DataSourceMode
} from '../services/mesService';

export const useDataMode = () => {
  const [mode, setMode] = useState<DataSourceMode>(() => getDataSourceMode());

  useEffect(() => subscribeDataSourceMode(setMode), []);

  const setModeExplicit = (nextMode: DataSourceMode) => {
    setDataSourceMode(nextMode);
  };

  const toggleMode = () => {
    const next: DataSourceMode = mode === 'live' ? 'mock' : 'live';
    setModeExplicit(next);
  };

  return useMemo(
    () => ({
      mode,
      isLive: mode === 'live',
      toggleMode,
      setMode: setModeExplicit
    }),
    [mode]
  );
};
