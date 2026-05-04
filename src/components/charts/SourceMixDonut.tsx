import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { formatPct } from '../../utils/format';

interface SourceMixEntry {
  name: string;
  value: number;
}

interface SourceMixDonutProps {
  data: SourceMixEntry[];
}

const colors = ['#38bdf8', '#f97316', '#22c55e', '#a855f7', '#facc15'];

export const SourceMixDonut = ({ data }: SourceMixDonutProps) => (
  <div className="h-52">
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} dataKey="value" innerRadius={40} outerRadius={70} paddingAngle={2}>
          {data.map((entry, index) => (
            <Cell key={entry.name} fill={colors[index % colors.length]} />
          ))}
        </Pie>
  <Tooltip formatter={(value: number | string) => formatPct(Number(value))} />
      </PieChart>
    </ResponsiveContainer>
  </div>
);
