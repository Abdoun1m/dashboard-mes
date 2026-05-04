import type { StatusTone } from '../../utils/format';
import { Badge } from '../ui/badge';

interface StatusPillProps {
  label: string;
  value: string;
  tone?: StatusTone;
}

export const StatusPill = ({ label, value, tone = 'muted' }: StatusPillProps) => (
  <Badge variant={tone} className="gap-2">
    <span className="text-[10px] text-zinc-500 dark:text-zinc-400">{label}</span>
    <span className="text-[11px] font-semibold text-current">{value}</span>
  </Badge>
);
