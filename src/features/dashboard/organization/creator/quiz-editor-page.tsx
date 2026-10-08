import 'server-only';

import type { JSX } from 'react';
import { Suspense } from 'react';

import { PageSkeleton } from '@/components/layout/page-skeleton';

import { NewQuizInitializer } from '@/features/quiz/components/new-quiz-initializer';
import { QuizEditor } from '@/features/quiz/components/quiz-editor';
import { loadCreatorQuizEditorFetcher } from '@/features/quiz/server/loaders/organization-creator-quiz-editor';
import { readForPage } from '@/server/auth/page-access';

// ----------------------------------------------------
// Teacher Quiz Editor View
// ----------------------------------------------------

type CreatorQuizEditViewProps = {
  orgSlug: string;
  quizId: string;
  role: string;
};

async function CreatorQuizEditorFetcher({ orgSlug, quizId, role }: CreatorQuizEditViewProps) {
  if (quizId === 'new') return <NewQuizInitializer />;
  const { quiz } = await readForPage(() => loadCreatorQuizEditorFetcher({ orgSlug, quizId, role }));

  return <QuizEditor quiz={quiz} />;
}

export function CreatorQuizEditView({ orgSlug, quizId, role }: CreatorQuizEditViewProps): JSX.Element {
  return (
    <div className='px-4 lg:px-6'>
      <Suspense fallback={<PageSkeleton />}>
        <CreatorQuizEditorFetcher orgSlug={orgSlug} quizId={quizId} role={role} />
      </Suspense>
    </div>
  );
}
