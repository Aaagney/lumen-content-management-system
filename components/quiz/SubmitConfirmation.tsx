'use client';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';

interface SubmitConfirmationProps {
  open: boolean;
  answeredCount: number;
  totalQuestions: number;
  submitting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function SubmitConfirmation({
  open,
  answeredCount,
  totalQuestions,
  submitting,
  onConfirm,
  onCancel,
}: SubmitConfirmationProps) {
  const unanswered = totalQuestions - answeredCount;
  const hasUnanswered = unanswered > 0;

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {hasUnanswered ? 'Submit Quiz?' : 'Submit your quiz?'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {hasUnanswered ? (
              <span className="space-y-1">
                <span className="block">
                  You have answered {answeredCount} of {totalQuestions} questions.
                </span>
                <span className="block">
                  You still have {unanswered} unanswered{' '}
                  {unanswered === 1 ? 'question' : 'questions'}.
                </span>
              </span>
            ) : (
              <span>
                You have answered all {totalQuestions} questions. Your quiz will be
                graded immediately.
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>
            {hasUnanswered ? 'Review Answers' : 'Go Back'}
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={submitting}>
            {submitting ? 'Submitting...' : hasUnanswered ? 'Submit Anyway' : 'Submit Quiz'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
