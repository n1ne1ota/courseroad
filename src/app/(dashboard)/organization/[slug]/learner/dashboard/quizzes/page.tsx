import { Suspense } from 'react';

import { LearnerQuizzesView } from '@/features/dashboard/organization/learner/quizzes/quizzes-page';
import { LearnerQuizzesViewSkeleton } from '@/features/dashboard/organization/learner/quizzes/quizzes-page-skeleton';
import { DashboardOrganizationLayout } from '@/features/dashboard/shared/shell/dashboard-organization-layout';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function LearnerQuizzesPage({ params }: PageProps) {
  const { slug } = await params;
  return (
    <DashboardOrganizationLayout role='learner' title='Quizzes'>
      <div className='flex flex-col'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>My Quizzes</h1>
          <p className='mt-1 text-muted-foreground'>Test your skills and track your progress.</p>
        </div>
        <Suspense fallback={<LearnerQuizzesViewSkeleton />}>
          <LearnerQuizzesView orgSlug={slug} />
        </Suspense>
      </div>
    </DashboardOrganizationLayout>
  );
}
