import { Droplet } from 'lucide-react';

interface TankLevelCardProps {
  title: string;
  low: number;
  high: number;
}

export const TankLevelCard = ({ title, low, high }: TankLevelCardProps) => (
  <article className="glass-card">
    <div className="flex items-center justify-between">
      <p className="subtle-label">{title}</p>
      <Droplet className="text-brand-600 dark:text-brand-400" size={18} />
    </div>
    <div className="mt-4 grid grid-cols-2 gap-3">
      <div className="rounded-2xl bg-zinc-100 p-3 dark:bg-zinc-800/70">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Bas</p>
        <p className="mt-1 text-2xl font-semibold">{low}%</p>
      </div>
      <div className="rounded-2xl bg-zinc-100 p-3 dark:bg-zinc-800/70">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Haut</p>
        <p className="mt-1 text-2xl font-semibold">{high}%</p>
      </div>
    </div>
  </article>
);
