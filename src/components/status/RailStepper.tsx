import { CheckCircle2, CircleDashed, Lock } from 'lucide-react';

interface RailStepperProps {
  steps: Array<{ key: string; done: boolean }>;
}

export const RailStepper = ({ steps }: RailStepperProps) => (
  <div className="glass-card">
    <p className="subtle-label">Étapes process</p>
    <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {steps.map((step) => (
        <div
          key={step.key}
          className={`rounded-2xl border p-4 transition-all ${
            step.done
              ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20'
              : 'border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">{step.key}</p>
            {step.done ? (
              <CheckCircle2 size={17} className="text-emerald-500" />
            ) : (
              <CircleDashed size={17} className="text-zinc-400" />
            )}
          </div>
          <p className="mt-3 inline-flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <Lock size={12} />
            {step.done ? 'validée' : 'en attente'}
          </p>
        </div>
      ))}
    </div>
  </div>
);
