import { KpiCard } from '../components/kpi/KpiCard';
import { Badge } from '../components/ui/badge';
import { StatusPill } from '../components/kpi/StatusPill';
import { Gauge } from '../components/charts/Gauge';
import { GenerationStackedBar } from '../components/charts/GenerationStackedBar';
import { ProductionConsumptionAreaChart } from '../components/charts/ProductionConsumptionAreaChart';
import { ScoreTimelineChart } from '../components/charts/ScoreTimelineChart';
import { SourceMixDonut } from '../components/charts/SourceMixDonut';
import { useMesQuery } from '../hooks/useMesQuery';
import { computeDerivedClientSideFallbacks, pickFromObject, pickNumber } from '../api/mesClient';
import { classifyStatus, formatAge, formatKw, safeNumber } from '../utils/format';

const toSeries = (payload: unknown, valueKey: string) => {
  if (Array.isArray(payload)) {
    return payload
      .map((point) => ({
        timestamp: String((point as Record<string, unknown>).timestamp ?? (point as Record<string, unknown>).time ?? ''),
        value: pickNumber((point as Record<string, unknown>)[valueKey]) ?? pickNumber((point as Record<string, unknown>).value)
      }))
      .filter((point) => point.value !== null);
  }
  if (payload && typeof payload === 'object') {
    const series = (payload as Record<string, unknown>).series;
    if (Array.isArray(series)) return toSeries(series, valueKey);
  }
  return [] as Array<{ timestamp: string; value: number | null }>;
};

const buildMix = (payload: unknown) => {
  if (payload && typeof payload === 'object') {
    const mix = (payload as Record<string, unknown>).mix ?? payload;
    if (mix && typeof mix === 'object') {
      return Object.entries(mix as Record<string, unknown>)
        .map(([name, value]) => ({ name, value: pickNumber(value) ?? 0 }))
        .filter((item) => item.value > 0);
    }
  }
  return [] as Array<{ name: string; value: number }>;
};

export const PowerGridPage = () => {
  const overview = useMesQuery<Record<string, unknown>>(['powergrid', 'overview'], '/api/powergrid/overview');
  const production = useMesQuery<Record<string, unknown> | unknown[]>(['powergrid', 'production'], '/api/powergrid/production');
  const consumption = useMesQuery<Record<string, unknown> | unknown[]>(['powergrid', 'consumption'], '/api/powergrid/consumption');
  const sourceMix = useMesQuery<Record<string, unknown>>(['powergrid', 'sourceMix'], '/api/powergrid/source-mix');
  const losses = useMesQuery<Record<string, unknown>>(['powergrid', 'losses'], '/api/powergrid/losses');
  const reserve = useMesQuery<Record<string, unknown>>(['powergrid', 'reserve'], '/api/powergrid/reserve');
  const served = useMesQuery<Record<string, unknown> | unknown[]>(['powergrid', 'served'], '/api/powergrid/served-status');
  const blackout = useMesQuery<Record<string, unknown>>(['powergrid', 'blackout'], '/api/powergrid/blackout-risk');
  const energyScore = useMesQuery<Record<string, unknown> | unknown[]>(['powergrid', 'energyScore'], '/api/powergrid/energy-score');
  const anomalies = useMesQuery<Record<string, unknown> | unknown[]>(['powergrid', 'anomaly'], '/api/powergrid/anomaly-summary');

  const derived = computeDerivedClientSideFallbacks(overview.data);
  const balanceStatus = (overview.data?.balanceStatus as string | undefined) ?? '—';

  const lossesValue = pickFromObject(losses.data, ['losses', 'value', 'percent']) ??
    pickFromObject(overview.data, ['losses', 'lossesPct']);

  const reserveValue = pickFromObject(reserve.data, ['reserve', 'value', 'margin']) ?? pickFromObject(overview.data, ['reserve']);

  const scoreSeries = toSeries(energyScore.data, 'score').map((point) => ({
    timestamp: point.timestamp || 't',
    value: Number(point.value ?? 0)
  }));

  const mixData = buildMix(sourceMix.data);

  const prodSeries = toSeries(production.data, 'production');
  const consSeries = toSeries(consumption.data, 'consumption');
  const areaData = prodSeries.map((prod, index) => ({
    timestamp: prod.timestamp || consSeries[index]?.timestamp || String(index + 1),
    production: Number(prod.value ?? 0),
    consumption: Number(consSeries[index]?.value ?? 0)
  }));

  const generationData = [
    {
      name: 'Generation',
      pe: pickFromObject(overview.data, ['pe', 'PE']) ?? 0,
      fs: pickFromObject(overview.data, ['fs', 'FS']) ?? 0,
      gs: pickFromObject(overview.data, ['gs', 'GS']) ?? 0
    }
  ];

  const servedRows = Array.isArray(served.data) ? served.data : (served.data?.rows as Record<string, unknown>[] | undefined) ?? [];
  const anomalyRows = Array.isArray(anomalies.data) ? anomalies.data : (anomalies.data?.rows as Record<string, unknown>[] | undefined) ?? [];

  const blackoutRiskValue = pickFromObject(blackout.data, ['risk', 'value', 'score']) ?? 0;
  
  const hasError = overview.isError || production.isError || consumption.isError || sourceMix.isError || 
    losses.isError || reserve.isError || served.isError || blackout.isError || energyScore.isError || anomalies.isError;

  return (
    <div className="space-y-6">
      {hasError && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
          <Badge variant="warning" className="mb-2">Données dégradées</Badge>
          <p className="text-xs text-amber-700 dark:text-amber-400">Certaines données du réseau électrique sont indisponibles - seules les informations accessibles sont affichées.</p>
        </div>
      )}
      <section className="grid gap-4 lg:grid-cols-3">
        <KpiCard
          label="TAP"
          value={derived.tap !== null ? formatKw(derived.tap) : '—'}
          tone={classifyStatus(derived.tap)}
          freshness={formatAge(overview.lastUpdated)}
          status={balanceStatus}
          helper="Total active production"
        />
        <KpiCard
          label="TCP"
          value={derived.tcp !== null ? formatKw(derived.tcp) : '—'}
          tone={classifyStatus(derived.tcp)}
          freshness={formatAge(overview.lastUpdated)}
          status={derived.delta !== null && derived.delta < 0 ? 'deficit' : 'surplus'}
          helper="Total consumption"
          isFallback={derived.fallbackTcp}
        />
        <KpiCard
          label="Delta"
          value={derived.delta !== null ? formatKw(derived.delta) : '—'}
          tone={derived.delta !== null && derived.delta < 0 ? 'critical' : 'ok'}
          freshness={formatAge(overview.lastUpdated)}
          status={derived.delta !== null && derived.delta < 0 ? 'deficit' : 'surplus'}
          helper="Production minus consumption"
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <div className="panel">
          <div className="flex items-center justify-between">
            <p className="panel-title">Power balance</p>
            <StatusPill label="balance" value={balanceStatus} tone={derived.delta !== null && derived.delta < 0 ? 'critical' : 'ok'} />
          </div>
          <ProductionConsumptionAreaChart data={areaData} />
        </div>
        <div className="panel space-y-4">
          <Gauge
            value={lossesValue ?? 0}
            max={100}
            label="Losses"
            unit="%"
            tone={lossesValue !== null && lossesValue > 10 ? 'warning' : 'ok'}
          />
          <Gauge
            value={reserveValue ?? 0}
            max={100}
            label="Reserve margin"
            unit="%"
            tone={reserveValue !== null && reserveValue < 15 ? 'warning' : 'ok'}
          />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <div className="panel">
          <p className="panel-title">Generation mix</p>
          <SourceMixDonut data={mixData} />
        </div>
        <div className="panel">
          <p className="panel-title">PE / FS / GS</p>
          <GenerationStackedBar data={generationData} />
        </div>
        <div className="panel">
          <div className="flex items-center justify-between">
            <p className="panel-title">Blackout risk</p>
            <StatusPill label="risk" value={`${blackoutRiskValue}`} tone={blackoutRiskValue > 60 ? 'critical' : 'warning'} />
          </div>
          <ScoreTimelineChart data={scoreSeries} color="#f97316" />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <div className="panel">
          <p className="panel-title">Load served</p>
          <div className="mt-3 overflow-auto">
            <table className="w-full text-xs">
              <thead className="text-left text-zinc-500 dark:text-zinc-400">
                <tr>
                  <th className="pb-2">Zone</th>
                  <th className="pb-2">Demand</th>
                  <th className="pb-2">Served</th>
                </tr>
              </thead>
              <tbody>
                {servedRows.length ? (
                  servedRows.map((row, index) => (
                    <tr key={index} className="border-t border-zinc-200/60 dark:border-zinc-800">
                      <td className="py-2">{String((row as Record<string, unknown>).zone ?? (row as Record<string, unknown>).label ?? `Z${index + 1}`)}</td>
                      <td className="py-2">{safeNumber((row as Record<string, unknown>).demand) ?? '—'}</td>
                      <td className="py-2">{safeNumber((row as Record<string, unknown>).served) ?? '—'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-3 text-zinc-500" colSpan={3}>
                      No served-load matrix available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="panel">
          <p className="panel-title">Anomaly summary</p>
          <div className="mt-3 space-y-2 text-xs">
            {anomalyRows.length ? (
              anomalyRows.map((row, index) => (
                <div key={index} className="rounded-md border border-zinc-200/60 px-3 py-2 dark:border-zinc-800">
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {String((row as Record<string, unknown>).title ?? (row as Record<string, unknown>).type ?? `Anomaly ${index + 1}`)}
                  </p>
                  <p className="text-zinc-500 dark:text-zinc-400">
                    {String((row as Record<string, unknown>).summary ?? (row as Record<string, unknown>).detail ?? '—')}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-zinc-500">No anomalies reported.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
