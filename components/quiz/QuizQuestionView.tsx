'use client';

import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { QuizQuestion } from '@/lib/quiz/types';
import { QuizProgress } from './QuizProgress';
import { QuestionNavigator } from './QuestionNavigator';
import { QuestionOption } from './QuestionOption';

interface QuizQuestionViewProps {
  quizTitle: string;
  question: QuizQuestion;
  questionIndex: number;
  totalQuestions: number;
  questions: QuizQuestion[];
  answers: Record<string, string | null>;
  onSelect: (questionId: string, optionId: string) => void;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
  onJump: (index: number) => void;
  isLast: boolean;
  submitting?: boolean;
}

export function QuizQuestionView({
  quizTitle,
  question,
  questionIndex,
  totalQuestions,
  questions,
  answers,
  onSelect,
  onPrevious,
  onNext,
  onSubmit,
  onJump,
  isLast,
  submitting,
}: QuizQuestionViewProps) {
  const selected = answers[question.id] ?? null;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-xl font-semibold tracking-tight">{quizTitle}</h1>
      </div>

      <QuizProgress current={questionIndex} total={totalQuestions} />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold leading-relaxed">
            <span className="mr-2 text-muted-foreground">
              Q{questionIndex + 1}.
            </span>
            {question.question}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            role="radiogroup"
            aria-label={`Answer options for question ${questionIndex + 1}`}
            className="space-y-3"
          >
            {question.options.map((option, i) => (
              <QuestionOption
                key={option.id}
                option={option}
                optionIndex={i}
                selected={selected === option.id}
                disabled={submitting}
                onSelect={() => onSelect(question.id, option.id)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <QuestionNavigator
        questions={questions}
        answers={answers}
        currentIndex={questionIndex}
        onJump={onJump}
      />

      <div className="flex items-center justify-between gap-3">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={questionIndex === 0 || submitting}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Previous
        </Button>

        {isLast ? (
          <Button onClick={onSubmit} disabled={submitting} className="gap-2">
            {submitting ? 'Submitting...' : 'Submit Quiz'}
            {!submitting && <ArrowRight className="h-4 w-4" aria-hidden />}
          </Button>
        ) : (
          <Button onClick={onNext} disabled={submitting} className="gap-2">
            Next
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
        )}
      </div>
    </div>
  );
}
