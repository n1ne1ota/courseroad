import type { JSX } from 'react';
import { Suspense } from 'react';

import { UnreadAnnouncementsCard } from '@/features/blog/components/announcements/announcement-views';
import {
  loadLearnerCourses,
  loadLearnerRecommendations,
  loadLearnerWorkspaces
} from '@/features/course/server/loaders/platform-learner';
import { CatalogCarousel } from '@/features/dashboard/platform/learner/catalog-carousel';
import { CatalogCarouselSkeleton } from '@/features/dashboard/platform/learner/catalog-carousel-skeleton';
import { LearnerHero } from '@/features/dashboard/platform/learner/learner-hero';
import { LearnerHeroSkeleton } from '@/features/dashboard/platform/learner/learner-hero-skeleton';
import { B2COrgList, B2COrgListHeader } from '@/features/dashboard/platform/learner/org-list';
import { B2COrgListSkeleton } from '@/features/dashboard/platform/learner/org-list-skeleton';
import { PersonalCourseList } from '@/features/dashboard/platform/learner/personal-course-list';
import { PersonalCourseListSkeleton } from '@/features/dashboard/platform/learner/personal-course-list-skeleton';
import { readForPage } from '@/server/auth/page-access';

async function Workspaces() {
  const memberships = await readForPage(() => loadLearnerWorkspaces());
  return <B2COrgList memberships={memberships} />;
}

async function MyLearning() {
  const courses = await readForPage(() => loadLearnerCourses());
  return <PersonalCourseList courses={courses} />;
}

async function Recommendations() {
  const courses = await readForPage(() => loadLearnerRecommendations());
  if (courses.length === 0) return null;

  return (
    <div className='mt-6 border-t border-border/40 pt-10'>
      <CatalogCarousel courses={courses} />
    </div>
  );
}

/**
 * The page shell (glow, section headings) is static and streams first; each data-dependent
 * section suspends on its own, with a skeleton that shares its layout constants.
 */
export default function LearnerDashboardPage(): JSX.Element {
  return (
    <>
      <div className='relative flex flex-col gap-6'>
        <div className='pointer-events-none absolute top-0 -left-20 size-[500px] rounded-full bg-brand/5 blur-[120px]' />

        <Suspense fallback={<LearnerHeroSkeleton />}>
          <LearnerHero />
        </Suspense>

        <Suspense fallback={null}>
          <UnreadAnnouncementsCard organization={null} />
        </Suspense>

        <section className='flex flex-col gap-5'>
          <B2COrgListHeader />
          <Suspense fallback={<B2COrgListSkeleton />}>
            <Workspaces />
          </Suspense>
        </section>

        <section className='flex flex-col gap-4'>
          <h3 className='text-xl font-bold tracking-tight text-foreground'>My Learning</h3>
          <Suspense fallback={<PersonalCourseListSkeleton />}>
            <MyLearning />
          </Suspense>
        </section>

        <Suspense fallback={<CatalogCarouselSkeleton />}>
          <Recommendations />
        </Suspense>
      </div>
    </>
  );
}
