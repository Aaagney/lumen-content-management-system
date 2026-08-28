'use client';

import { Clock, FileText, ListChecks, ArrowLeft, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Quiz } from '@/lib/quiz/types';

interface QuizStartProps {
  quiz: Quiz;
  onStart: () => void;
  onBackToArticle: () => void;
}

export function QuizStart({ quiz, onStart, onBackToArticle }: QuizStartProps) {
  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader className="space-y-3 text-center">
        <Badge variant="secondary" className="mx-auto w-fit">
          Multiple Choice Quiz
        </Badge>
        <CardTitle className="text-3xl font-bold tracking-tight">{quiz.title}</CardTitle>
        {quiz.description && (
          <CardDescription className="text-base leading-relaxed">
            {quiz.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col items-center gap-2 rounded-lg border bg-muted/40 p-4 text-center">
            <ListChecks className="h-5 w-5 text-muted-foreground" aria-hidden />
            <span className="text-2xl font-semibold">{quiz.questions.length}</span>
            <span className="text-sm text-muted-foreground">Questions</span>
          </div>
          <div className="flex flex-col items-center gap-2 rounded-lg border bg-muted/40 p-4 text-center">
            <FileText className="h-5 w-5 text-muted-foreground" aria-hidden />
            <span className="text-sm font-medium">Multiple Choice</span>
            <span className="text-sm text-muted-foreground">One answer each</span>
          </div>
          <div className="flex flex-col items-center gap-2 rounded-lg border bg-muted/40 p-4 text-center">
            <Clock className="h-5 w-5 text-muted-foreground" aria-hidden />
            <span className="text-2xl font-semibold">
              {quiz.estimatedTime ?? '~5'}
            </span>
            <span className="text-sm text-muted-foreground">Minutes</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button size="lg" onClick={onStart} className="gap-2">
            <Play className="h-4 w-4" aria-hidden />
            Start Quiz
          </Button>
          <Button size="lg" variant="outline" onClick={onBackToArticle} className="gap-2">
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to Article
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
