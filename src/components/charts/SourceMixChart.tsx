import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

interface SourceMixChartProps {
  windPct: number;
  solarPct: number;
  gasPct: number;
}

const COLORS = ['#E11D48', '#FB7185', '#9F1239'];

export const SourceMixChart = ({ windPct, solarPct, gasPct }: SourceMixChartProps) => {
  const data = [
    { name: 'Éolien', value: windPct },
    { name: 'Solaire', value: solarPct },
    { name: 'Gaz', value: gasPct }
  ];

  return (
    <article className="glass-card h-[320px]">
      <p className="subtle-label">Mix des sources</p>
      <ResponsiveContainer width="100%" height="88%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={65} outerRadius={95} stroke="none">
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: 16,
              border: '1px solid #27272a',
              background: '#18181b',
              color: '#f4f4f5'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </article>
  );
};
