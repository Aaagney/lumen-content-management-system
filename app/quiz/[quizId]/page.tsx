import { QuizFlow } from '@/components/quiz/QuizFlow';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { quizId: string };
}

export default function QuizPage({ params }: PageProps) {
  const articleHref = `/articles/${params.quizId}`;
  return (
    <main className="min-h-screen bg-background py-10 px-4 sm:py-16">
      <QuizFlow quizId={params.quizId} articleHref={articleHref} />
    </main>
  );
}
