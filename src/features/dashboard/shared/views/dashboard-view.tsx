import 'server-only';

import type { JSX } from 'react';

import type { Route } from 'next';
import Link from 'next/link';

import { ArrowRight, BookOpen, Sparkles } from 'lucide-react';

import { EnrolledCourseCard } from '@/features/course/components/enrolled-course-card';
import { loadLearnerDashboardView } from '@/features/course/server/loaders/organization-view';
import { CreatorDashboardCards } from '@/features/dashboard/organization/creator/analytics-cards';
import { CreatorDashboardChart } from '@/features/dashboard/organization/creator/analytics-chart';
import { CreatorDashboardTable } from '@/features/dashboard/organization/creator/analytics-table';
import { dashboardMockData } from '@/features/dashboard/shared/data/dashboard-data';
import { LearnerDashboardStats } from '@/features/dashboard/shared/ui/learner-dashboard-stats';
import { readForPage } from '@/server/auth/page-access';

// ----------------------------------------------------
// Creator / Admin Dashboard View
// ----------------------------------------------------

export async function CreatorDashboardView(): Promise<JSX.Element> {
  return (
    <>
      <CreatorDashboardCards />
      <div className='px-4 lg:px-6'>
        <CreatorDashboardChart />
      </div>
      <CreatorDashboardTable data={dashboardMockData} />
    </>
  );
}

// ----------------------------------------------------
// Learner Dashboard View
// ----------------------------------------------------

type LearnerDashboardViewProps = {
  orgSlug: string;
};

export async function LearnerDashboardView({ orgSlug }: LearnerDashboardViewProps): Promise<JSX.Element> {
  const {
    user,
    completedCoursesCount,
    inProgressCoursesCount,
    coursesWithProgress,
    enrolledCount,
    resumeCourse,
    orgRoutes
  } = await readForPage(() => loadLearnerDashboardView({ orgSlug }));

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
              {user.firstName}
            </span>
            !
          </h2>
          <p className='mt-2 max-w-xl text-lg text-muted-foreground'>
            Ready to jump back in? You have{' '}
            <span className='font-semibold text-foreground'>{inProgressCoursesCount} courses</span> currently in
            progress.
          </p>
        </div>

        {resumeCourse && resumeCourse.status !== 'COMPLETED' && (
          <div className='z-10 shrink-0'>
            <Link
              className='group flex items-center justify-between gap-4 rounded-2xl bg-foreground px-6 py-4 text-background shadow-xl transition-all hover:scale-105 hover:shadow-primary/20 active:scale-95'
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
        )}
      </div>

      {/* Metrics Row */}
      <LearnerDashboardStats
        completedCount={completedCoursesCount}
        enrolledCount={enrolledCount}
        inProgressCount={inProgressCoursesCount}
      />

      {/* Course Grid */}
      <div className='mt-4 flex flex-col gap-6 delay-200 duration-700 fade-in'>
        <div className='flex items-center justify-between'>
          <h3 className='text-xl font-bold tracking-tight'>My Learning</h3>
        </div>

        {coursesWithProgress.length > 0 ? (
          <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
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
        ) : (
          <div className='border-default-300 bg-default-50/50 flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center backdrop-blur-sm'>
            <div className='bg-default-100 text-default-400 flex size-16 items-center justify-center rounded-full'>
              <BookOpen className='size-8' />
            </div>
            <h4 className='mt-4 text-lg font-semibold text-foreground'>No courses yet</h4>
            <p className='mt-1 max-w-sm text-sm text-muted-foreground'>
              You haven&apos;t enrolled in any courses. Browse the catalog to start your learning journey!
            </p>
            <Link
              className='mt-6 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105 active:scale-95'
              href={'/courses' as Route}
            >
              Browse Catalog
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
