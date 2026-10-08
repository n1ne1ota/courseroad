import type { JSX } from 'react';
import { Suspense } from 'react';

import { Sparkles } from 'lucide-react';

import { PageSkeleton } from '@/components/layout/page-skeleton';

import { loadLearnerDashboardContent } from '@/features/course/server/loaders/platform-learner';
import { CatalogCarousel } from '@/features/dashboard/platform/learner/catalog-carousel';
import { B2COrgList } from '@/features/dashboard/platform/learner/org-list';
import { PersonalCourseList } from '@/features/dashboard/platform/learner/personal-course-list';
import { DashboardPlatformLayout } from '@/features/dashboard/shared/shell/dashboard-platform-layout';
import { readForPage } from '@/server/auth/page-access';

async function LearnerDashboardContent() {
  const { user, memberships, inProgressCount, coursesWithProgress, catalogRecommendations } = await readForPage(() =>
    loadLearnerDashboardContent()
  );

  return (
    <div className='relative flex flex-col gap-8 px-4 pt-6 pb-12 lg:px-6'>
      <div className='pointer-events-none absolute top-0 -left-20 size-[500px] rounded-full bg-primary/5 blur-[120px]' />

      {/* Hero Header */}
      <div className='border-default-200/50 relative flex flex-col justify-between gap-6 overflow-hidden rounded-3xl border bg-background/40 p-8 shadow-sm backdrop-blur-md md:flex-row md:items-center'>
        <div className='pointer-events-none absolute -top-20 -right-20 size-[300px] rounded-full bg-secondary/10 blur-[80px]' />

        <div className='slide-in-bottom-1 z-10'>
          <div className='mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 backdrop-blur-md'>
            <Sparkles className='size-4 text-primary' />
            <span className='text-xs font-semibold tracking-wider text-primary uppercase'>Learner Portal</span>
          </div>
          <h2 className='text-3xl font-extrabold tracking-tight text-foreground md:text-4xl'>
            Welcome back,{' '}
            <span className='bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent'>
              {user.firstName || 'Learner'}
            </span>
            !
          </h2>
          <p className='mt-2 max-w-xl text-lg text-muted-foreground'>
            Ready to learn? You have <span className='font-semibold text-foreground'>{inProgressCount} courses</span>{' '}
            currently in progress.
          </p>
        </div>
      </div>

      {/* B2B Workspaces Switcher */}
      <B2COrgList memberships={memberships} />

      {/* My Learning */}
      <div className='flex flex-col gap-4'>
        <h3 className='text-xl font-bold tracking-tight text-foreground'>My Learning</h3>
        <PersonalCourseList courses={coursesWithProgress} />
      </div>

      {/* Recommendations */}
      {catalogRecommendations.length > 0 && (
        <div className='mt-6 border-t border-border/40 pt-10'>
          <CatalogCarousel courses={catalogRecommendations} />
        </div>
      )}
    </div>
  );
}

export default function LearnerDashboardPage(): JSX.Element {
  return (
    <DashboardPlatformLayout role='learner' title='My Learning'>
      <Suspense fallback={<PageSkeleton />}>
        <LearnerDashboardContent />
      </Suspense>
    </DashboardPlatformLayout>
  );
}
