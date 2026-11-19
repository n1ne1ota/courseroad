import 'server-only';

import type { JSX } from 'react';
import { Suspense } from 'react';

import { NewQuizInitializer } from '@/features/quiz/components/new-quiz-initializer';
import { QuizEditor } from '@/features/quiz/components/quiz-editor';
import { QuizEditorSkeleton } from '@/features/quiz/components/quiz-editor-skeleton';
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
    <Suspense fallback={<QuizEditorSkeleton />}>
      <CreatorQuizEditorFetcher orgSlug={orgSlug} quizId={quizId} role={role} />
    </Suspense>
  );
}
