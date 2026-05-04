import { Line, LineChart, ResponsiveContainer } from 'recharts';

interface FreshnessPoint {
  timestamp: string;
  value: number;
}

interface FreshnessSparklineProps {
  data: FreshnessPoint[];
  color?: string;
}

export const FreshnessSparkline = ({ data, color = '#38bdf8' }: FreshnessSparklineProps) => (
  <div className="h-16">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);
