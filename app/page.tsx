import Link from 'next/link';
import { ArrowRight, ListChecks } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function Home() {
  return (
    <main className="min-h-screen bg-background px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="space-y-3 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Quiz Attempt &amp; Results
          </h1>
          <p className="text-muted-foreground">
            Demo module showing the full reader quiz experience.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Introduction to Artificial Intelligence</CardTitle>
            <CardDescription>
              Read the article, then take the associated quiz to test your understanding.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="outline">
              <Link href="/articles/ai-fundamentals">Read Article</Link>
            </Button>
            <Button asChild className="gap-2">
              <Link href="/quiz/ai-fundamentals">
                <ListChecks className="h-4 w-4" />
                Take Quiz
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
