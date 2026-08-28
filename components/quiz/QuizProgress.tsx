'use client';

import { ProgressBar } from './ProgressBar';

interface QuizProgressProps {
  current: number;
  total: number;
}

export function QuizProgress({ current, total }: QuizProgressProps) {
  const percent = total === 0 ? 0 : Math.round(((current + 1) / total) * 100);
  return (
    <div className="space-y-2" aria-label="Quiz progress">
      <div className="flex items-center justify-between text-sm font-medium">
        <span className="text-muted-foreground">
          Question {current + 1} of {total}
        </span>
        <span className="text-muted-foreground">{percent}%</span>
      </div>
      <ProgressBar value={percent} className="h-2" />
    </div>
  );
}
