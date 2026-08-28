export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  correctAnswer: string;
  explanation: string;
}

export interface Quiz {
  id: string;
  articleId: string;
  title: string;
  description: string;
  estimatedTime?: number;
  questions: QuizQuestion[];
}

export interface UserAnswer {
  questionId: string;
  selectedAnswer: string | null;
}

export interface QuestionResult {
  questionId: string;
  selectedAnswer: string | null;
  correctAnswer: string;
  correct: boolean;
  explanation: string;
  question: string;
  options: QuizOption[];
}

export interface QuizResult {
  score: number;
  totalQuestions: number;
  percentage: number;
  correctAnswers: number;
  incorrectAnswers: number;
  results: QuestionResult[];
}

export type QuizStatus = 'loading' | 'start' | 'attempt' | 'submitting' | 'results' | 'error' | 'empty';
