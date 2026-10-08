import 'server-only';

import type { JSX } from 'react';

import type { Route } from 'next';
import Link from 'next/link';

import { Button } from '@kurume-ui/core';
import { PlusCircle } from 'lucide-react';

import { QuizDeleteButton } from '@/features/quiz/components/quiz-delete-button';
import { loadCreatorQuizzesView } from '@/features/quiz/server/loaders/organization-creator-quizzes';
import { readForPage } from '@/server/auth/page-access';

import type { Quiz } from '@/features/quiz/editor-types';

type CreatorQuizzesViewProps = {
  orgSlug: string;
  role: string;
};

export async function CreatorQuizzesView({ orgSlug, role }: CreatorQuizzesViewProps): Promise<JSX.Element> {
  const { quizzes, orgRoutes } = await readForPage(() => loadCreatorQuizzesView({ orgSlug, role }));

  return (
    <div className='flex flex-col px-4 py-8 lg:px-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Quizzes</h1>
          <p className='text-muted-foreground'>Manage your interactive quizzes.</p>
        </div>
        <Link href={`${orgRoutes.roleBase}/quizzes/new` as Route}>
          <Button>
            <PlusCircle className='mr-2 h-4 w-4' />
            Create Quiz
          </Button>
        </Link>
      </div>
      <div className='mt-6 rounded-md border'>
        <div className='p-6'>
          {quizzes.length === 0 ? (
            <div className='flex flex-col items-center justify-center p-8 text-center'>
              <h3 className='text-lg font-medium'>No quizzes found</h3>
              <p className='mt-2 text-sm text-muted-foreground'>You haven&apos;t created any quizzes yet.</p>
            </div>
          ) : (
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              {quizzes.map((quiz: Quiz & { _count: { questions: number; submissions: number } }) => (
                <div key={quiz.id} className='group relative'>
                  <Link
                    className='flex h-full flex-col justify-between rounded-lg border p-6 transition-colors hover:border-primary'
                    href={orgRoutes.quizEditOrTake(quiz.id)}
                  >
                    <div>
                      <h3 className='font-semibold tracking-tight'>{quiz.title}</h3>
                      <p className='mt-2 line-clamp-2 text-sm text-muted-foreground'>
                        {quiz.description ? quiz.description.replace(/<[^>]*>/g, '') : 'No description provided.'}
                      </p>
                    </div>
                    <div className='mt-4 flex items-center text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100'>
                      Edit Quiz &rarr;
                    </div>
                  </Link>
                  <div className='absolute top-3 right-3'>
                    <QuizDeleteButton quizId={quiz.id} quizTitle={quiz.title} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
