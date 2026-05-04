import { RadialBar, RadialBarChart, ResponsiveContainer } from 'recharts';

interface ProcessScoreRadialProps {
  value: number;
}

export const ProcessScoreRadial = ({ value }: ProcessScoreRadialProps) => {
  const data = [{ name: 'score', value }];
  return (
    <div className="h-40">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart innerRadius="70%" outerRadius="90%" data={data} startAngle={90} endAngle={-270}>
          <RadialBar background dataKey="value" fill="#22c55e" />
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  );
};
