import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface LineConfig {
  key: string;
  color: string;
  label: string;
}

interface MultiLineTrendChartProps {
  data: Array<{ timestamp: string }>;
  lines: LineConfig[];
  domain?: [number | 'auto', number | 'auto'];
  formatter?: (value: number) => string;
}

export const MultiLineTrendChart = ({
  data,
  lines,
  domain = ['auto', 'auto'],
  formatter
}: MultiLineTrendChartProps) => (
  <div className="h-52">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <XAxis dataKey="timestamp" tick={{ fontSize: 10 }} stroke="#6b7280" />
        <YAxis tick={{ fontSize: 10 }} stroke="#6b7280" domain={domain} />
        <Tooltip formatter={(value: number | string) => (formatter ? formatter(Number(value)) : Number(value).toFixed(2))} />
        {lines.map((line) => (
          <Line key={line.key} type="monotone" dataKey={line.key} name={line.label} stroke={line.color} strokeWidth={2} dot={false} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  </div>
);
