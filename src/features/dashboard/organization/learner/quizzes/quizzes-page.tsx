import 'server-only';

import type { JSX } from 'react';

import Link from 'next/link';

import { Button } from '@courseroad/kurume-ui';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@courseroad/kurume-ui';
import { BookOpenIcon, ClockIcon, HelpCircleIcon, RotateCcwIcon, TrophyIcon } from 'lucide-react';

import { loadLearnerQuizzesView } from '@/features/quiz/server/loaders/organization-learner-quizzes-quizzes';
import { readForPage } from '@/server/auth/page-access';

export async function LearnerQuizzesView({ orgSlug }: { orgSlug: string }): Promise<JSX.Element> {
  const { quizzes, orgRoutes } = await readForPage(() => loadLearnerQuizzesView({ orgSlug }));

  if (quizzes.length === 0) {
    return (
      <div className='mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center'>
        <div className='mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted'>
          <HelpCircleIcon className='h-7 w-7 text-muted-foreground' />
        </div>
        <h3 className='text-lg font-semibold'>No quizzes available</h3>
        <p className='mt-1 max-w-xs text-sm text-muted-foreground'>
          Quizzes from your enrolled courses will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className='mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
      {quizzes.map(quiz => {
        const totalQuestions = quiz.questionsCount;
        const attemptCount = quiz.attemptCount;
        const bestPct = quiz.bestPct;
        const lastAttempt = quiz.lastAttempt;
        const hasAttempted = attemptCount > 0;

        return (
          <Card key={quiz.id} className='group flex flex-col overflow-hidden'>
            {quiz.thumbnailUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img className='aspect-video w-full object-cover' alt={quiz.title} src={quiz.thumbnailUrl} />
            )}
            <CardHeader>
              <div className='flex items-start justify-between gap-2'>
                <CardTitle className='line-clamp-2 text-base leading-snug'>{quiz.title}</CardTitle>
                {hasAttempted && bestPct !== null && (
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums ${
                      bestPct >= 80
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : bestPct >= 50
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}
                  >
                    Best: {bestPct}%
                  </span>
                )}
              </div>
              <CardDescription className='line-clamp-2'>
                {quiz.description ? quiz.description.replace(/<[^>]*>/g, '') : 'Test your knowledge.'}
              </CardDescription>
            </CardHeader>

            <CardContent className='flex flex-1 flex-col gap-3'>
              <div className='flex flex-wrap gap-3'>
                <div className='flex items-center gap-1.5 text-sm text-muted-foreground'>
                  <BookOpenIcon className='h-3.5 w-3.5' />
                  <span>
                    {totalQuestions} question{totalQuestions !== 1 ? 's' : ''}
                  </span>
                </div>
                {quiz.timeLimit && (
                  <div className='flex items-center gap-1.5 text-sm text-muted-foreground'>
                    <ClockIcon className='h-3.5 w-3.5' />
                    <span>{quiz.timeLimit} min</span>
                  </div>
                )}
                {hasAttempted && (
                  <div className='flex items-center gap-1.5 text-sm text-muted-foreground'>
                    <RotateCcwIcon className='h-3.5 w-3.5' />
                    <span>
                      {attemptCount} attempt{attemptCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>

              {lastAttempt && (
                <div className='space-y-1'>
                  <div className='flex items-center justify-between text-xs text-muted-foreground'>
                    <span className='flex items-center gap-1'>
                      <TrophyIcon className='h-3 w-3' />
                      Last attempt
                    </span>
                    <span className='font-medium text-foreground'>
                      {lastAttempt.score}/{totalQuestions}
                    </span>
                  </div>
                  <div className='h-1.5 w-full overflow-hidden rounded-full bg-muted'>
                    <div
                      className='h-full rounded-full bg-primary transition-all'
                      style={{
                        width: `${Math.round((lastAttempt.score / totalQuestions) * 100)}%`
                      }}
                    />
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter>
              <Button className='w-full' asChild variant={hasAttempted ? 'outline' : 'primary'}>
                <Link href={orgRoutes.quizEditOrTake(quiz.id)}>
                  {hasAttempted ? (
                    <>
                      <RotateCcwIcon className='mr-2 h-4 w-4' />
                      Retake Quiz
                    </>
                  ) : (
                    'Start Quiz →'
                  )}
                </Link>
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
