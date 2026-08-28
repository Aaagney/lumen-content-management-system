'use client';

import { useState } from 'react';
import { Check, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import type { QuestionResult } from '@/lib/quiz/types';

interface AnswerReviewProps {
  results: QuestionResult[];
  onRetake: () => void;
  onBackToArticle: () => void;
}

export function AnswerReview({ results, onRetake, onBackToArticle }: AnswerReviewProps) {
  const [openAll, setOpenAll] = useState(false);
  const [accordionValue, setAccordionValue] = useState<string[]>([]);

  const toggleAll = () => {
    if (openAll) {
      setAccordionValue([]);
      setOpenAll(false);
    } else {
      setAccordionValue(results.map((r) => r.questionId));
      setOpenAll(true);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <h2 className="text-2xl font-bold tracking-tight">Answer Review</h2>
        <Button variant="outline" size="sm" onClick={toggleAll}>
          {openAll ? 'Collapse All' : 'Expand All'}
        </Button>
      </div>

      <Accordion
        type="multiple"
        value={accordionValue}
        onValueChange={(v) => {
          setAccordionValue(v as string[]);
          setOpenAll(v.length === results.length);
        }}
        className="space-y-3"
      >
        {results.map((r, i) => {
          const selectedText =
            r.options.find((o) => o.id === r.selectedAnswer)?.text ??
            'No answer selected';
          const correctText =
            r.options.find((o) => o.id === r.correctAnswer)?.text ?? '';

          return (
            <AccordionItem
              key={r.questionId}
              value={r.questionId}
              className={cn(
                'overflow-hidden rounded-lg border data-[state=open]:shadow-sm',
                r.correct ? 'border-l-4 border-l-emerald-500' : 'border-l-4 border-l-red-500'
              )}
            >
              <AccordionTrigger className="gap-3 px-4 hover:no-underline">
                <span
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                    r.correct
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                  )}
                >
                  {r.correct ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                </span>
                <span className="flex-1 text-left text-sm font-medium">
                  Question {i + 1}
                </span>
                <span
                  className={cn(
                    'mr-2 text-xs font-semibold',
                    r.correct
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-red-600 dark:text-red-400'
                  )}
                >
                  {r.correct ? 'Correct' : 'Incorrect'}
                </span>
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4">
                  <p className="font-medium leading-relaxed">{r.question}</p>

                  <div
                    className={cn(
                      'rounded-md border p-3 text-sm',
                      r.correct
                        ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30'
                        : 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30'
                    )}
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Your answer
                    </p>
                    <p className="mt-1 font-medium">{selectedText}</p>
                  </div>

                  {!r.correct && (
                    <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm dark:border-emerald-900 dark:bg-emerald-950/30">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Correct answer
                      </p>
                      <p className="mt-1 font-medium">{correctText}</p>
                    </div>
                  )}

                  <div className="rounded-md bg-muted/40 p-3 text-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Explanation
                    </p>
                    <p className="mt-1 leading-relaxed text-foreground">
                      {r.explanation}
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button variant="outline" onClick={onRetake}>
          Retake Quiz
        </Button>
        <Button variant="outline" onClick={onBackToArticle}>
          Back to Article
        </Button>
      </div>
    </div>
  );
}

export function AnswerReviewCard({ result, index }: { result: QuestionResult; index: number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm">{result.question}</p>
        <p className="mt-2 text-xs text-muted-foreground">Question {index + 1}</p>
      </CardContent>
    </Card>
  );
}
