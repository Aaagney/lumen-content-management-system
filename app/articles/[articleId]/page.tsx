import Link from 'next/link';
import { ArrowLeft, ListChecks } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface PageProps {
  params: { articleId: string };
}

export default function ArticlePage({ params }: PageProps) {
  return (
    <main className="min-h-screen bg-background px-4 py-12 sm:py-20">
      <article className="mx-auto max-w-2xl space-y-8">
        <div>
          <Button asChild variant="ghost" size="sm" className="mb-6 gap-2">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              All Articles
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Introduction to Artificial Intelligence
          </h1>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            This is a placeholder article page. In the full application, the article
            content would appear here. The quiz module links back to this page via the
            configurable article route.
          </p>
        </div>

        <div className="prose prose-neutral max-w-none space-y-4 text-foreground/90">
          <p>
            Artificial intelligence (AI) is the field of computer science focused on
            building systems that perform tasks normally requiring human intelligence,
            such as reasoning, perception, and language understanding.
          </p>
          <p>
            Within AI, machine learning enables systems to learn patterns from data
            rather than being explicitly programmed. This article introduces the core
            ideas you need before taking the quiz.
          </p>
        </div>

        <Card className="border-dashed">
          <CardContent className="flex flex-col items-start gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium">Ready to test your knowledge?</p>
              <p className="text-sm text-muted-foreground">
                Take a 10-question quiz based on this article.
              </p>
            </div>
            <Button asChild className="gap-2">
              <Link href={`/quiz/${params.articleId}`}>
                <ListChecks className="h-4 w-4" />
                Take Quiz
              </Link>
            </Button>
          </CardContent>
        </Card>
      </article>
    </main>
  );
}
