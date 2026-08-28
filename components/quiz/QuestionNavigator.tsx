'use client';

import { cn } from '@/lib/utils';
import type { QuizQuestion } from '@/lib/quiz/types';

interface QuestionNavigatorProps {
  questions: QuizQuestion[];
  answers: Record<string, string | null>;
  currentIndex: number;
  onJump: (index: number) => void;
}

export function QuestionNavigator({
  questions,
  answers,
  currentIndex,
  onJump,
}: QuestionNavigatorProps) {
  return (
    <nav aria-label="Question navigator" className="w-full">
      <p className="mb-2 text-xs font-medium text-muted-foreground">
        Question navigator
      </p>
      <div
        role="tablist"
        className="grid grid-cols-5 gap-2 sm:grid-cols-10"
      >
        {questions.map((q, i) => {
          const answered = answers[q.id] != null;
          const isCurrent = i === currentIndex;
          return (
            <button
              key={q.id}
              role="tab"
              aria-selected={isCurrent}
              aria-label={`Go to question ${i + 1}${
                answered ? ' (answered)' : ' (unanswered)'
              }`}
              onClick={() => onJump(i)}
              className={cn(
                'flex h-9 w-full items-center justify-center rounded-md border text-sm font-medium transition-all',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                isCurrent
                  ? 'border-foreground bg-foreground text-background'
                  : answered
                    ? 'border-foreground/40 bg-foreground/5 text-foreground'
                    : 'border-border bg-background text-muted-foreground hover:border-foreground/30'
              )}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm border border-foreground bg-foreground" />
          Current
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm border border-foreground/40 bg-foreground/5" />
          Answered
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm border border-border bg-background" />
          Unanswered
        </span>
      </div>
    </nav>
  );
}
