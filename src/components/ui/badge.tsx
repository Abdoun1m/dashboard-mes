import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] transition-colors',
  {
    variants: {
      variant: {
        ok: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        warning: 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400',
        critical: 'border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400',
        info: 'border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400',
        muted: 'border-zinc-500/20 bg-zinc-500/10 text-zinc-500 dark:text-zinc-400'
      }
    },
    defaultVariants: {
      variant: 'muted'
    }
  }
);

export interface BadgeProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export const Badge = ({ className, variant, ...props }: BadgeProps) => (
  <div className={cn(badgeVariants({ variant }), className)} {...props} />
);
