import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatKw } from '../../utils/format';

interface GenerationPoint {
  name: string;
  pe: number;
  fs: number;
  gs: number;
}

interface GenerationStackedBarProps {
  data: GenerationPoint[];
}

export const GenerationStackedBar = ({ data }: GenerationStackedBarProps) => (
  <div className="h-52">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#6b7280" />
        <YAxis tick={{ fontSize: 10 }} stroke="#6b7280" />
  <Tooltip formatter={(value: number | string) => formatKw(Number(value))} />
        <Bar dataKey="pe" stackId="gen" fill="#38bdf8" />
        <Bar dataKey="fs" stackId="gen" fill="#22c55e" />
        <Bar dataKey="gs" stackId="gen" fill="#f97316" />
      </BarChart>
    </ResponsiveContainer>
  </div>
);
