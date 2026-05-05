import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatKw } from '../../utils/format';

interface ProductionConsumptionPoint {
  timestamp: string;
  production: number;
  consumption: number;
}

interface ProductionConsumptionAreaChartProps {
  data: ProductionConsumptionPoint[];
}

export const ProductionConsumptionAreaChart = ({ data }: ProductionConsumptionAreaChartProps) => (
  !data.length ? (
    <div className="flex h-52 items-center justify-center text-xs text-zinc-500">No historical data yet</div>
  ) : (
    <div className="h-52">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <XAxis dataKey="timestamp" tick={{ fontSize: 10 }} stroke="#6b7280" />
          <YAxis tick={{ fontSize: 10 }} stroke="#6b7280" />
          <Tooltip formatter={(value: number | string) => formatKw(Number(value))} />
          <Area type="monotone" dataKey="production" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
          <Area type="monotone" dataKey="consumption" stroke="#f97316" fill="#f97316" fillOpacity={0.2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
);
