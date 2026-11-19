import { Suspense } from 'react';

import type { Route } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Button, Card, Separator } from '@courseroad/iota-ui';
import { HtmlContent } from '@courseroad/iota-ui/editor';

import { BookOpen, CheckCircle2, Crown, PlayCircle } from 'lucide-react';

import { resolveThumbnailUrl } from '@/lib/api/cdn-url';
import { env } from '@/lib/config/env';

import { PublicPageShell } from '@/components/layout/public-page-shell';

import { CourseDetailSkeleton, CourseEnrollmentSkeleton } from '@/features/course/components/course-detail-skeleton';
import { getCachedCourse, loadEnrollmentSection } from '@/features/course/server/loaders/public-courses-course';
import { readForPage } from '@/server/auth/page-access';

import type { PublicLesson, PublicModule } from '@/features/course/types/course-types';

import { EnrollmentForm } from './_components/enrollment-form';

const ENROLLMENT_BENEFITS = ['Full lifetime access', 'Learn at your own pace'] as const;

function BenefitList() {
  return (
    <ul className='mt-6 space-y-3 text-sm'>
      {ENROLLMENT_BENEFITS.map(benefit => (
        <li key={benefit} className='flex items-start gap-3'>
          <CheckCircle2 className='mt-0.5 size-4 shrink-0 text-success' />
          <span>{benefit}</span>
        </li>
      ))}
    </ul>
  );
}

// Ensure this component is async and streamed
async function EnrollmentSection({ courseId, isPaid }: { courseId: string; isPaid: boolean }) {
  const { isEnrolled, resumeHref } = await readForPage(() => loadEnrollmentSection({ courseId }));

  if (isEnrolled) {
    return (
      <>
        <Button fullWidth color='brand' render={<Link href={resumeHref as Route} />} size='lg'>
          Resume Course
        </Button>
        <BenefitList />
      </>
    );
  }

  if (isPaid && !env.NEXT_PUBLIC_PAYMENTS_ENABLED) {
    return <p role='status'>Paid enrollment is not available in this environment.</p>;
  }

  return (
    <>
      <EnrollmentForm courseId={courseId} />
      <BenefitList />
    </>
  );
}

/** The page frame is the skeleton: everything below the route params depends on the course, so it all suspends. */
export default function CourseLandingPage(props: { params: Promise<{ courseId: string }> }) {
  return (
    <Suspense fallback={<CourseDetailSkeleton />}>
      <CourseDetail params={props.params} />
    </Suspense>
  );
}

async function CourseDetail(props: { params: Promise<{ courseId: string }> }) {
  const params = await props.params;
  const courseId = params.courseId;

  // Use the cached IO query. Everything else will render statically as PPR shell!
  const course = await readForPage(() => getCachedCourse(courseId));

  if (!course) notFound();

  const creator = course.creator;

  const imageUrl = resolveThumbnailUrl(course.thumbnailFileName);

  const creatorName = creator?.firstName ? `${creator.firstName} ${creator.lastName || ''}`.trim() : 'Instructor';

  const displayPrice =
    course.price !== null && course.price !== undefined
      ? course.price === 0
        ? 'Free'
        : `$${(course.price / 100).toFixed(2)}`
      : 'Free';

  const totalLessons = course.modules.reduce((acc: number, m: PublicModule) => acc + m.lessons.length, 0);

  return (
    <PublicPageShell>
      <div className='flex flex-col'>
        <Link
          className='mb-8 inline-block w-fit text-sm text-muted-foreground transition-colors hover:text-foreground'
          href='/courses'
        >
          &larr; All courses
        </Link>

        {/* Hero Summary + Enrollment Card */}
        <div className='grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center lg:gap-12'>
          <div className='flex flex-col justify-center gap-6'>
            <div className='flex items-center gap-3 text-sm font-medium tracking-wider text-muted-foreground uppercase'>
              <span>{course.category || 'General'}</span>
              <span>&bull;</span>
              <span>{course.level || 'All Levels'}</span>
            </div>
            <h1 className='text-3xl leading-[1.1] font-medium tracking-tight text-foreground sm:text-4xl lg:text-5xl'>
              {course.title}
            </h1>
            <p className='text-lg leading-relaxed text-muted-foreground'>
              {course.shortDescription || 'Master this topic with expert-led lessons and practical exercises.'}
            </p>
            <div className='flex flex-wrap items-center gap-4 text-sm font-medium'>
              <div className='flex items-center gap-1.5'>
                <Crown className='size-5 text-brand' />
                <span>By {creatorName}</span>
              </div>
              <div className='flex items-center gap-1.5'>
                <BookOpen className='size-5 text-muted-foreground' />
                <span>{totalLessons} Lessons</span>
              </div>
            </div>
          </div>

          <div className='flex items-center justify-center lg:justify-end'>
            <Card className='w-full max-w-md' shadow='md' variant='frosted-glass'>
              <div className='aspect-video w-full bg-muted'>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className='h-full w-full object-cover' alt={course.title} src={imageUrl} />
              </div>
              <div className='p-6'>
                <div className='mb-6 flex items-baseline gap-2'>
                  <span className='text-3xl font-semibold tracking-tight'>{displayPrice}</span>
                </div>

                <Suspense fallback={<CourseEnrollmentSkeleton />}>
                  <EnrollmentSection courseId={course.id} isPaid={(course.price ?? 0) > 0} />
                </Suspense>
              </div>
            </Card>
          </div>
        </div>

        <Separator className='my-10 sm:my-12' />

        {/* Content Section */}
        <div className='grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-12'>
          {/* Left Col (About & Curriculum) */}
          <div className='space-y-10 lg:col-span-2'>
            <section>
              <h2 className='mb-6 text-2xl font-medium tracking-tight'>About This Course</h2>
              <Card className='p-6 sm:p-8' shadow='sm' variant='frosted-glass'>
                {course.description ? (
                  <HtmlContent className='max-w-none' html={course.description} />
                ) : (
                  <p className='text-muted-foreground'>No full description provided.</p>
                )}
              </Card>
            </section>

            <section>
              <h2 className='mb-6 text-2xl font-medium tracking-tight'>Course Curriculum</h2>
              <div className='space-y-4'>
                {course.modules.length > 0 ? (
                  course.modules.map((module: PublicModule, i: number) => (
                    <Card key={module.id} shadow='sm' variant='frosted-glass'>
                      <div className='flex items-center justify-between gap-4 p-5'>
                        <h3 className='font-semibold'>
                          <span className='mr-3 text-brand opacity-80'>Module {i + 1}</span>
                          {module.title}
                        </h3>
                        <span className='shrink-0 text-sm text-muted-foreground'>{module.lessons.length} lessons</span>
                      </div>
                      <Separator />
                      <div className='divide-y divide-border'>
                        {module.lessons.map((lesson: PublicLesson) => (
                          <div
                            key={lesson.id}
                            className='flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/20'
                          >
                            {lesson.hasVideo ? (
                              <PlayCircle className='size-5 shrink-0 text-brand/70' />
                            ) : (
                              <BookOpen className='size-5 shrink-0 text-muted-foreground/70' />
                            )}
                            <span className='flex-1 text-sm font-medium'>{lesson.title}</span>
                          </div>
                        ))}
                        {module.lessons.length === 0 ? (
                          <div className='px-5 py-4 text-sm text-muted-foreground'>No lessons added yet.</div>
                        ) : null}
                      </div>
                    </Card>
                  ))
                ) : (
                  <p className='text-muted-foreground'>Modules and lessons are still being planned.</p>
                )}
              </div>
            </section>
          </div>

          {/* Right Col (Instructor) */}
          <div className='space-y-8'>
            <section>
              <h2 className='mb-6 text-xl font-medium tracking-tight'>Your Instructor</h2>
              <Card className='p-6' shadow='sm' variant='frosted-glass'>
                <div className='flex items-center gap-4'>
                  <div className='flex size-14 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xl font-semibold text-brand'>
                    {creator?.firstName?.[0] || 'I'}
                  </div>
                  <div>
                    <div className='font-semibold'>{creatorName}</div>
                    <div className='text-sm text-muted-foreground'>Course Creator</div>
                  </div>
                </div>
              </Card>
            </section>
          </div>
        </div>
      </div>
    </PublicPageShell>
  );
}
