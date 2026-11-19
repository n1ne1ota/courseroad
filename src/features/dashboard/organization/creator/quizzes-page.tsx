import 'server-only';

import type { JSX } from 'react';
import { Suspense } from 'react';

import type { Route } from 'next';
import Link from 'next/link';

import { Button } from '@kurume-ui/core';
import { PlusCircle } from 'lucide-react';

import { createOrgRoutes } from '@/lib/routes/org';
import { cn } from '@/lib/utils/cn';

import { DashboardContentPanel, DashboardPageShell } from '@/features/dashboard/shared/ui/dashboard-page-shell';
import { listCardClass, listCardGridClass } from '@/features/dashboard/shared/ui/dashboard-surfaces';
import { ListCardGridSkeleton } from '@/features/dashboard/shared/ui/list-card-grid-skeleton';
import { QuizDeleteButton } from '@/features/quiz/components/quiz-delete-button';
import { loadCreatorQuizzesView } from '@/features/quiz/server/loaders/organization-creator-quizzes';
import { readForPage } from '@/server/auth/page-access';

import type { Quiz } from '@/features/quiz/types/editor-types';

type CreatorQuizzesViewProps = {
  orgSlug: string;
  role: string;
};

async function CreatorQuizList({ orgSlug, role }: CreatorQuizzesViewProps): Promise<JSX.Element> {
  const { quizzes, orgRoutes } = await readForPage(() => loadCreatorQuizzesView({ orgSlug, role }));

  if (quizzes.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center p-8 text-center'>
        <h3 className='text-lg font-medium'>No quizzes found</h3>
        <p className='mt-2 text-sm text-muted-foreground'>You haven&apos;t created any quizzes yet.</p>
      </div>
    );
  }

  return (
    <div className={listCardGridClass}>
      {quizzes.map((quiz: Quiz & { _count: { questions: number; submissions: number } }) => (
        <div key={quiz.id} className='group relative'>
          <Link
            className={cn(listCardClass, 'h-full transition-colors hover:border-brand')}
            href={orgRoutes.quizEditOrTake(quiz.id)}
          >
            <div>
              <h3 className='font-semibold tracking-tight'>{quiz.title}</h3>
              <p className='mt-2 line-clamp-2 text-sm text-muted-foreground'>
                {quiz.description ? quiz.description.replace(/<[^>]*>/g, '') : 'No description provided.'}
              </p>
            </div>
            <div className='mt-4 flex items-center text-sm font-medium text-brand opacity-0 transition-opacity group-hover:opacity-100'>
              Edit Quiz &rarr;
            </div>
          </Link>
          <div className='absolute top-3 right-3'>
            <QuizDeleteButton quizId={quiz.id} quizTitle={quiz.title} />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Static heading, "Create Quiz" action, and panel stream first; the quiz list suspends on its own skeleton. */
export function CreatorQuizzesView({ orgSlug, role }: CreatorQuizzesViewProps): JSX.Element {
  const orgRoutes = createOrgRoutes(orgSlug, role);

  return (
    <DashboardPageShell
      actions={
        <Link href={`${orgRoutes.roleBase}/quizzes/new` as Route}>
          <Button>
            <PlusCircle className='mr-2 h-4 w-4' />
            Create Quiz
          </Button>
        </Link>
      }
      description='Manage your interactive quizzes.'
      title='Quizzes'
    >
      <DashboardContentPanel>
        <Suspense fallback={<ListCardGridSkeleton />}>
          <CreatorQuizList orgSlug={orgSlug} role={role} />
        </Suspense>
      </DashboardContentPanel>
    </DashboardPageShell>
  );
}
