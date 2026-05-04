import { Pie, PieChart, ResponsiveContainer, Cell } from 'recharts';
import { formatPct, type StatusTone } from '../../utils/format';

interface GaugeProps {
  value: number;
  max?: number;
  label: string;
  unit?: string;
  tone?: StatusTone;
}

const toneColors: Record<NonNullable<GaugeProps['tone']>, string> = {
  ok: '#10b981',
  warning: '#f59e0b',
  critical: '#ef4444',
  info: '#38bdf8',
  muted: '#6b7280'
};

export const Gauge = ({ value, max = 100, label, unit, tone = 'ok' }: GaugeProps) => {
  const pct = Math.max(0, Math.min(1, value / max));
  const data = [
    { name: 'value', value: pct * 100 },
    { name: 'rest', value: 100 - pct * 100 }
  ];

  return (
    <div className="flex items-center gap-4">
      <div className="h-20 w-24">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              startAngle={180}
              endAngle={0}
              innerRadius={30}
              outerRadius={40}
              paddingAngle={0}
              dataKey="value"
            >
              <Cell fill={toneColors[tone]} />
              <Cell fill="#1f2937" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div>
        <p className="panel-title">{label}</p>
        <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {unit ? `${value.toFixed(1)} ${unit}` : formatPct(pct * 100, 1)}
        </p>
      </div>
    </div>
  );
};
