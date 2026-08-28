'use client';

import { ArrowLeft, RotateCcw, ScrollText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ProgressBar } from '@/components/quiz/ProgressBar';
import type { QuizResult } from '@/lib/quiz/types';

interface QuizResultsProps {
  result: QuizResult;
  onReview: () => void;
  onRetake: () => void;
  onBackToArticle: () => void;
}

function performanceMessage(percentage: number): string {
  if (percentage >= 90) return 'Excellent work!';
  if (percentage >= 70) return 'Great job!';
  if (percentage >= 50)
    return 'Good attempt. Review the explanations to strengthen your understanding.';
  return 'Keep learning and try again.';
}

export function QuizResults({
  result,
  onReview,
  onRetake,
  onBackToArticle,
}: QuizResultsProps) {
  const message = performanceMessage(result.percentage);

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardContent className="space-y-8 p-8 text-center">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Quiz Complete
          </p>
          <div className="text-5xl font-bold tracking-tight">
            {result.score}{' '}
            <span className="text-muted-foreground">/ {result.totalQuestions}</span>
          </div>
          <div className="text-2xl font-semibold">{result.percentage}%</div>
        </div>

        <Progress value={result.percentage} className="h-3 transition-all duration-500" />

        <p className="text-base text-muted-foreground">{message}</p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border bg-emerald-50 p-4 dark:bg-emerald-950/30">
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {result.correctAnswers}
            </p>
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
              Correct
            </p>
          </div>
          <div className="rounded-lg border bg-red-50 p-4 dark:bg-red-950/30">
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {result.incorrectAnswers}
            </p>
            <p className="text-sm font-medium text-red-700 dark:text-red-300">
              Incorrect
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={onReview} className="gap-2">
            <ScrollText className="h-4 w-4" aria-hidden />
            Review Answers
          </Button>
          <Button variant="outline" onClick={onRetake} className="gap-2">
            <RotateCcw className="h-4 w-4" aria-hidden />
            Retake Quiz
          </Button>
          <Button variant="outline" onClick={onBackToArticle} className="gap-2">
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to Article
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
