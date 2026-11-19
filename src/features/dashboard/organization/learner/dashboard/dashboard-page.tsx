import 'server-only';

import type { JSX } from 'react';
import { cache, Suspense } from 'react';

import type { Route } from 'next';
import Link from 'next/link';

import { ArrowRight, BookOpen } from 'lucide-react';

import { EnrolledCourseCard } from '@/features/course/components/enrolled-course-card';
import { loadLearnerDashboardPage } from '@/features/course/server/loaders/organization-learner-dashboard';
import { LearnerHeroSkeleton } from '@/features/dashboard/platform/learner/learner-hero-skeleton';
import { PersonalCourseListSkeleton } from '@/features/dashboard/platform/learner/personal-course-list-skeleton';
import { courseGridClass } from '@/features/dashboard/shared/ui/dashboard-surfaces';
import { LearnerDashboardStats } from '@/features/dashboard/shared/ui/learner-dashboard-stats';
import { LearnerDashboardStatsSkeleton } from '@/features/dashboard/shared/ui/learner-dashboard-stats-skeleton';
import { LearnerHeroFrame } from '@/features/dashboard/shared/ui/learner-hero-frame';
import { readForPage } from '@/server/auth/page-access';

type LearnerDashboardPageProps = {
  orgSlug: string;
};

/** Per-request dedupe so the hero/stats and the course grid share one load across their boundaries. */
const loadDashboard = cache((orgSlug: string) => readForPage(() => loadLearnerDashboardPage({ orgSlug })));

async function DashboardHeroAndStats({ orgSlug }: LearnerDashboardPageProps): Promise<JSX.Element> {
  const { user, completedCoursesCount, inProgressCoursesCount, enrolledCount, resumeCourse, orgRoutes } =
    await loadDashboard(orgSlug);

  return (
    <>
      <LearnerHeroFrame
        aside={
          resumeCourse && resumeCourse.status !== 'COMPLETED' ? (
            <div className='z-10 shrink-0'>
              <Link
                className='group flex items-center justify-between gap-4 rounded-2xl bg-foreground px-6 py-4 text-background shadow-xl transition-all hover:scale-105 hover:shadow-brand/20 active:scale-95'
                href={orgRoutes.learn(resumeCourse.enrollment.courseId)}
              >
                <div className='flex flex-col'>
                  <span className='text-xs font-semibold uppercase opacity-70'>Resume</span>
                  <span className='line-clamp-1 max-w-[150px] text-sm font-bold'>
                    {resumeCourse.enrollment.course.title}
                  </span>
                </div>
                <div className='flex size-10 shrink-0 items-center justify-center rounded-full bg-background/20 backdrop-blur-sm transition-colors group-hover:bg-background/30'>
                  <ArrowRight className='size-5' />
                </div>
              </Link>
            </div>
          ) : null
        }
      >
        <h2 className='text-3xl font-extrabold tracking-tight text-foreground md:text-4xl'>
          Welcome back,{' '}
          <span className='bg-gradient-to-r from-brand to-secondary bg-clip-text text-transparent'>
            {user.firstName}
          </span>
          !
        </h2>
        <p className='mt-2 max-w-xl text-lg text-muted-foreground'>
          Ready to jump back in? You have{' '}
          <span className='font-semibold text-foreground'>{inProgressCoursesCount} courses</span> currently in progress.
        </p>
      </LearnerHeroFrame>

      <LearnerDashboardStats
        completedCount={completedCoursesCount}
        enrolledCount={enrolledCount}
        inProgressCount={inProgressCoursesCount}
      />
    </>
  );
}

async function DashboardCourses({ orgSlug }: LearnerDashboardPageProps): Promise<JSX.Element> {
  const { coursesWithProgress } = await loadDashboard(orgSlug);

  if (coursesWithProgress.length === 0) {
    return (
      <div className='border-default-300 bg-default-50/50 flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center backdrop-blur-sm'>
        <div className='bg-default-100 text-default-400 flex size-16 items-center justify-center rounded-full'>
          <BookOpen className='size-8' />
        </div>
        <h4 className='mt-4 text-lg font-semibold text-foreground'>No courses yet</h4>
        <p className='mt-1 max-w-sm text-sm text-muted-foreground'>
          You haven&apos;t enrolled in any courses. Browse the catalog to start your learning journey!
        </p>
        <Link
          className='mt-6 rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-brand-foreground transition-transform hover:scale-105 active:scale-95'
          href={'/courses' as Route}
        >
          Browse Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className={courseGridClass}>
      {coursesWithProgress.map(({ enrollment, progressPercentage, status }) => (
        <EnrolledCourseCard
          key={enrollment.id}
          id={enrollment.id}
          courseId={enrollment.course.id}
          progressPercentage={progressPercentage}
          slug={enrollment.course.slug}
          status={status}
          thumbnailFileName={enrollment.course.thumbnailFileName}
          title={enrollment.course.title}
        />
      ))}
    </div>
  );
}

/** Glow and "My Learning" heading stream first; hero/stats and the course grid each suspend on a matching skeleton. */
export function LearnerDashboardPage({ orgSlug }: LearnerDashboardPageProps): JSX.Element {
  return (
    <div className='relative flex flex-col gap-6'>
      <div className='pointer-events-none absolute top-0 -left-20 size-[500px] rounded-full bg-brand/5 blur-[120px]' />

      <Suspense
        fallback={
          <>
            <LearnerHeroSkeleton />
            <LearnerDashboardStatsSkeleton />
          </>
        }
      >
        <DashboardHeroAndStats orgSlug={orgSlug} />
      </Suspense>

      <div className='flex flex-col gap-6 delay-200 duration-700 fade-in'>
        <div className='flex items-center justify-between'>
          <h3 className='text-xl font-bold tracking-tight'>My Learning</h3>
        </div>
        <Suspense fallback={<PersonalCourseListSkeleton />}>
          <DashboardCourses orgSlug={orgSlug} />
        </Suspense>
      </div>
    </div>
  );
}
