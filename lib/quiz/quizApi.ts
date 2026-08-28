import type { Quiz, QuizResult, UserAnswer } from './types';
import { sampleQuiz } from './sample-data';

const MOCK_DELAY = 400;

function delay<T>(value: T, ms = MOCK_DELAY): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export async function getQuiz(quizId: string): Promise<Quiz> {
  if (quizId !== sampleQuiz.id) {
    throw new Error(`Quiz "${quizId}" not found`);
  }
  return delay(sampleQuiz);
}

function computeResult(quiz: Quiz, answers: UserAnswer[]): QuizResult {
  const answerMap = new Map(answers.map((a) => [a.questionId, a.selectedAnswer]));

  const results = quiz.questions.map((q) => {
    const selectedAnswer = answerMap.get(q.id) ?? null;
    const correct = selectedAnswer === q.correctAnswer;
    return {
      questionId: q.id,
      selectedAnswer,
      correctAnswer: q.correctAnswer,
      correct,
      explanation: q.explanation,
      question: q.question,
      options: q.options,
    };
  });

  const correctAnswers = results.filter((r) => r.correct).length;
  const totalQuestions = quiz.questions.length;
  const incorrectAnswers = totalQuestions - correctAnswers;
  const percentage =
    totalQuestions === 0 ? 0 : Math.round((correctAnswers / totalQuestions) * 100);

  return {
    score: correctAnswers,
    totalQuestions,
    percentage,
    correctAnswers,
    incorrectAnswers,
    results,
  };
}

export async function submitQuizAttempt(
  quizId: string,
  answers: UserAnswer[]
): Promise<QuizResult> {
  if (quizId !== sampleQuiz.id) {
    throw new Error(`Quiz "${quizId}" not found`);
  }
  return delay(computeResult(sampleQuiz, answers));
}

export { computeResult };
