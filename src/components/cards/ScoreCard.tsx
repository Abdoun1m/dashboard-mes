import { scoreLevel } from '../../utils/format';

interface ScoreCardProps {
  title: string;
  score: number;
}

export const ScoreCard = ({ title, score }: ScoreCardProps) => {
  const level = scoreLevel(score);
  const widthClass =
    score >= 95
      ? 'w-full'
      : score >= 90
        ? 'w-11/12'
        : score >= 80
          ? 'w-5/6'
          : score >= 70
            ? 'w-3/4'
            : score >= 60
              ? 'w-2/3'
              : score >= 50
                ? 'w-1/2'
                : 'w-1/3';

  return (
    <article className="glass-card">
      <p className="subtle-label">{title}</p>
      <div className="mt-3 flex items-end justify-between">
        <p className="text-4xl font-semibold text-zinc-900 dark:text-zinc-100">{score}</p>
        <p className="rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-800 dark:bg-brand-900/50 dark:text-brand-200">
          {level}
        </p>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
        <div className={`h-full rounded-full bg-gradient-to-r from-brand-700 via-brand-500 to-brand-300 ${widthClass}`} />
      </div>
    </article>
  );
};
