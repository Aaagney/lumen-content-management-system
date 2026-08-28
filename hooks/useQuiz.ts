'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Quiz, QuizResult, QuizStatus, UserAnswer } from '@/lib/quiz/types';
import { getQuiz, submitQuizAttempt } from '@/lib/quiz/quizApi';

export interface UseQuizState {
  quiz: Quiz | null;
  status: QuizStatus;
  error: string | null;
  currentIndex: number;
  answers: Record<string, string | null>;
  result: QuizResult | null;
  answeredCount: number;
  totalQuestions: number;
}

export interface UseQuizActions {
  start: () => void;
  selectAnswer: (questionId: string, optionId: string) => void;
  goTo: (index: number) => void;
  next: () => void;
  previous: () => void;
  submit: () => Promise<void>;
  retake: () => void;
  backToStart: () => void;
}

export function useQuiz(quizId: string): UseQuizState & UseQuizActions {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [status, setStatus] = useState<QuizStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | null>>({});
  const [result, setResult] = useState<QuizResult | null>(null);

  useEffect(() => {
    let active = true;
    setStatus('loading');
    setError(null);
    getQuiz(quizId)
      .then((q) => {
        if (!active) return;
        setQuiz(q);
        if (!q.questions.length) {
          setStatus('empty');
          return;
        }
        const initial: Record<string, string | null> = {};
        q.questions.forEach((question) => {
          initial[question.id] = null;
        });
        setAnswers(initial);
        setStatus('start');
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Unable to load this quiz.');
        setStatus('error');
      });
    return () => {
      active = false;
    };
  }, [quizId]);

  const start = useCallback(() => {
    setCurrentIndex(0);
    setStatus('attempt');
  }, []);

  const selectAnswer = useCallback((questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  }, []);

  const goTo = useCallback(
    (index: number) => {
      if (!quiz) return;
      const clamped = Math.max(0, Math.min(index, quiz.questions.length - 1));
      setCurrentIndex(clamped);
    },
    [quiz]
  );

  const next = useCallback(() => {
    if (!quiz) return;
    if (currentIndex < quiz.questions.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  }, [currentIndex, quiz]);

  const previous = useCallback(() => {
    setCurrentIndex((i) => Math.max(0, i - 1));
  }, []);

  const submit = useCallback(async () => {
    if (!quiz) return;
    setStatus('submitting');
    const userAnswers: UserAnswer[] = quiz.questions.map((q) => ({
      questionId: q.id,
      selectedAnswer: answers[q.id] ?? null,
    }));
    try {
      const res = await submitQuizAttempt(quiz.id, userAnswers);
      setResult(res);
      setStatus('results');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to submit your attempt. Please try again.');
      setStatus('attempt');
    }
  }, [answers, quiz]);

  const retake = useCallback(() => {
    if (!quiz) return;
    const reset: Record<string, string | null> = {};
    quiz.questions.forEach((question) => {
      reset[question.id] = null;
    });
    setAnswers(reset);
    setResult(null);
    setCurrentIndex(0);
    setStatus('start');
  }, [quiz]);

  const backToStart = useCallback(() => {
    setCurrentIndex(0);
    setStatus('start');
  }, []);

  const answeredCount = useMemo(
    () => (quiz ? quiz.questions.filter((q) => answers[q.id] != null).length : 0),
    [answers, quiz]
  );

  const totalQuestions = quiz?.questions.length ?? 0;

  return {
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
  };
}
