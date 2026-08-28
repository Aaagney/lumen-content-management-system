'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { QuizOption } from '@/lib/quiz/types';

interface QuestionOptionProps {
  option: QuizOption;
  optionIndex: number;
  selected: boolean;
  disabled?: boolean;
  onSelect: () => void;
}

export function QuestionOption({
  option,
  optionIndex,
  selected,
  disabled,
  onSelect,
}: QuestionOptionProps) {
  const letter = String.fromCharCode(65 + optionIndex);
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg border p-4 text-left text-sm transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'hover:border-foreground/30',
        selected
          ? 'border-foreground bg-foreground/5 ring-1 ring-foreground/20'
          : 'border-border bg-background',
        disabled && 'cursor-not-allowed opacity-60'
      )}
    >
      <span
        aria-hidden
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-colors',
          selected
            ? 'border-foreground bg-foreground text-background'
            : 'border-border bg-background text-muted-foreground'
        )}
      >
        {selected ? <Check className="h-4 w-4" /> : letter}
      </span>
      <span className="font-medium leading-relaxed">{option.text}</span>
    </button>
  );
}
