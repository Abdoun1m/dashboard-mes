import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface SourceOutputChartProps {
  wind: number;
  solar: number;
  gas: number;
}

export const SourceOutputChart = ({ wind, solar, gas }: SourceOutputChartProps) => {
  const data = [
    { name: 'Éolien', value: wind },
    { name: 'Solaire', value: solar },
    { name: 'Gaz', value: gas }
  ];

  return (
    <article className="glass-card h-[320px]">
      <p className="subtle-label">Production par source</p>
      <ResponsiveContainer width="100%" height="88%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip
            contentStyle={{
              borderRadius: 16,
              border: '1px solid #27272a',
              background: '#18181b',
              color: '#f4f4f5'
            }}
          />
          <Bar dataKey="value" radius={[10, 10, 0, 0]} fill="#E11D48" />
        </BarChart>
      </ResponsiveContainer>
    </article>
  );
};
