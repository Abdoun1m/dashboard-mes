import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface ThroughputPoint {
  timestamp: string;
  value: number;
}

interface ThroughputChartProps {
  data: ThroughputPoint[];
}

export const ThroughputChart = ({ data }: ThroughputChartProps) => (
  <div className="h-44">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <XAxis dataKey="timestamp" tick={{ fontSize: 10 }} stroke="#6b7280" />
        <YAxis tick={{ fontSize: 10 }} stroke="#6b7280" />
  <Tooltip formatter={(value: number | string) => `${Number(value).toFixed(1)}`} />
        <Line type="monotone" dataKey="value" stroke="#f97316" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);
