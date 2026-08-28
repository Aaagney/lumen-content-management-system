'use client';

import { useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuiz } from '@/hooks/useQuiz';
import { QuizStart } from './QuizStart';
import { QuizQuestionView } from './QuizQuestionView';
import { SubmitConfirmation } from './SubmitConfirmation';
import { QuizResults } from './QuizResults';
import { AnswerReview } from './AnswerReview';

interface QuizFlowProps {
  quizId: string;
  articleHref: string;
}

export function QuizFlow({ quizId, articleHref }: QuizFlowProps) {
  const {
    quiz,
    status,
    error,
    currentIndex,
    answers,
    result,
    answeredCount,
    totalQuestions,
    start,
    selectAnswer,
    goTo,
    next,
    previous,
    submit,
    retake,
    backToStart,
  } = useQuiz(quizId);

  const [showConfirm, setShowConfirm] = useState(false);
  const [showReview, setShowReview] = useState(false);

  const handleBackToArticle = () => {
    window.location.href = articleHref;
  };

  const handleRequestSubmit = () => {
    setShowConfirm(true);
  };

  const handleConfirmSubmit = () => {
    setShowConfirm(false);
    void submit();
  };

  const handleRetake = () => {
    setShowReview(false);
    retake();
  };

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden />
        <p className="text-sm text-muted-foreground">Loading quiz...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col items-center justify-center gap-4 py-24 text-center">
        <AlertCircle className="h-8 w-8 text-destructive" aria-hidden />
        <p className="text-sm text-muted-foreground">
          {error ?? 'Unable to load this quiz.'}
        </p>
        <Button variant="outline" onClick={handleBackToArticle}>
          Back to Article
        </Button>
      </div>
    );
  }

  if (status === 'empty' || (quiz && quiz.questions.length === 0)) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col items-center justify-center gap-4 py-24 text-center">
        <p className="text-sm text-muted-foreground">This quiz has no questions.</p>
        <Button variant="outline" onClick={handleBackToArticle}>
          Back to Article
        </Button>
      </div>
    );
  }

  if (!quiz) return null;

  if (status === 'start') {
    return <QuizStart quiz={quiz} onStart={start} onBackToArticle={handleBackToArticle} />;
  }

  if (status === 'attempt' || status === 'submitting') {
    const question = quiz.questions[currentIndex];
    const isLast = currentIndex === quiz.questions.length - 1;
    return (
      <>
        <QuizQuestionView
          quizTitle={quiz.title}
          question={question}
          questionIndex={currentIndex}
          totalQuestions={totalQuestions}
          questions={quiz.questions}
          answers={answers}
          onSelect={selectAnswer}
          onPrevious={previous}
          onNext={next}
          onSubmit={handleRequestSubmit}
          onJump={goTo}
          isLast={isLast}
          submitting={status === 'submitting'}
        />
        <SubmitConfirmation
          open={showConfirm}
          answeredCount={answeredCount}
          totalQuestions={totalQuestions}
          submitting={status === 'submitting'}
          onConfirm={handleConfirmSubmit}
          onCancel={() => setShowConfirm(false)}
        />
      </>
    );
  }

  if (status === 'results' && result) {
    if (showReview) {
      return (
        <AnswerReview
          results={result.results}
          onRetake={handleRetake}
          onBackToArticle={handleBackToArticle}
        />
      );
    }
    return (
      <QuizResults
        result={result}
        onReview={() => setShowReview(true)}
        onRetake={handleRetake}
        onBackToArticle={handleBackToArticle}
      />
    );
  }

  return null;
}
