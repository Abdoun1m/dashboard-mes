import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string;
  hint?: string;
  icon?: LucideIcon;
  tone?: 'neutral' | 'success' | 'danger' | 'brand';
}

const toneClass: Record<NonNullable<MetricCardProps['tone']>, string> = {
  neutral: 'from-zinc-100/80 to-zinc-50 dark:from-zinc-800/70 dark:to-zinc-900/70',
  success: 'from-emerald-100/70 to-emerald-50 dark:from-emerald-900/30 dark:to-zinc-900/70',
  danger: 'from-rose-100/80 to-rose-50 dark:from-rose-900/30 dark:to-zinc-900/70',
  brand: 'from-brand-100/70 to-brand-50 dark:from-brand-900/30 dark:to-zinc-900/70'
};

export const MetricCard = ({ label, value, hint, icon: Icon, tone = 'neutral' }: MetricCardProps) => (
  <motion.article
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35 }}
    whileHover={{ y: -2, scale: 1.005 }}
    className={`glass-card bg-gradient-to-br ${toneClass[tone]}`}
  >
    <div className="flex items-start justify-between">
      <p className="subtle-label">{label}</p>
      {Icon ? <Icon size={18} className="text-brand-600 dark:text-brand-400" /> : null}
    </div>
    <p className="kpi-value mt-3">{value}</p>
    {hint ? <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{hint}</p> : null}
  </motion.article>
);
