import type { ReactNode } from 'react';
import { Suspense } from 'react';

import { LearnShellSkeleton } from '@/features/course/components/learn-skeletons';
import { LearnLayout } from '@/features/dashboard/organization/learner/learn/learn-layout';

type Props = {
  children: ReactNode;
  params: Promise<{ courseId: string; slug: string }>;
};

async function LearnerLearnShell({ children, params }: Props) {
  const { courseId, slug } = await params;
  return (
    <LearnLayout courseId={courseId} slug={slug}>
      {children}
    </LearnLayout>
  );
}

export default function LearnerLearnLayout(props: Props) {
  return (
    <Suspense fallback={<LearnShellSkeleton />}>
      <LearnerLearnShell params={props.params}>{props.children}</LearnerLearnShell>
    </Suspense>
  );
}
