import { Suspense } from 'react';

import type { Route } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Button } from '@courseroad/kurume-ui';
import { HtmlContent } from '@courseroad/kurume-ui/editor';
import { BookOpen, CheckCircle2, Crown, PlayCircle } from 'lucide-react';

import { resolveThumbnailUrl } from '@/lib/api/cdn-url';

import { getCachedCourse, loadEnrollmentSection } from '@/features/course/server/loaders/public-courses-course';
import { readForPage } from '@/server/auth/page-access';

import type { PublicLesson, PublicModule } from '@/features/course/types';

function EnrollmentSkeleton() {
  return (
    <div className='flex animate-pulse flex-col gap-6'>
      <div className='bg-default-200/50 h-12 w-full rounded-md' />
      <ul className='space-y-3'>
        <li className='bg-default-200/50 h-5 w-3/4 rounded' />
        <li className='bg-default-200/50 h-5 w-2/3 rounded' />
      </ul>
    </div>
  );
}

// Ensure this component is async and streamed
async function EnrollmentSection({ courseId }: { courseId: string }) {
  const { isEnrolled, resumeHref } = await readForPage(() => loadEnrollmentSection({ courseId }));

  if (isEnrolled) {
    return (
      <>
        <Button className='w-full' asChild size='lg' variant='primary'>
          <Link href={resumeHref as Route}>Resume Course</Link>
        </Button>
        <ul className='mt-6 space-y-3 text-sm'>
          <li className='flex items-start gap-3'>
            <CheckCircle2 className='mt-0.5 size-4 shrink-0 text-success' />
            <span>Full lifetime access</span>
          </li>
          <li className='flex items-start gap-3'>
            <CheckCircle2 className='mt-0.5 size-4 shrink-0 text-success' />
            <span>Learn at your own pace</span>
          </li>
        </ul>
      </>
    );
  }

  return (
    <>
      <EnrollmentForm courseId={courseId} />
      <ul className='mt-6 space-y-3 text-sm'>
        <li className='flex items-start gap-3'>
          <CheckCircle2 className='mt-0.5 size-4 shrink-0 text-success' />
          <span>Full lifetime access</span>
        </li>
        <li className='flex items-start gap-3'>
          <CheckCircle2 className='mt-0.5 size-4 shrink-0 text-success' />
          <span>Learn at your own pace</span>
        </li>
      </ul>
    </>
  );
}

// Note: To truly use action state we need a client component. I will create `enrollment-form.tsx`.
import { EnrollmentForm } from './_components/enrollment-form';

export default async function CourseLandingPage(props: { params: Promise<{ courseId: string }> }) {
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
    <div className='relative flex flex-col'>
      {/* Hero Header */}
      <div className='relative bg-muted/30 pt-16 pb-20'>
        <div className='mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 lg:grid-cols-2 lg:px-6'>
          <div className='flex flex-col justify-center gap-6'>
            <div className='flex items-center gap-3 text-sm font-semibold tracking-wider text-muted-foreground uppercase'>
              <span>{course.category || 'General'}</span>
              <span>&bull;</span>
              <span>{course.level || 'All Levels'}</span>
            </div>
            <h1 className='text-4xl font-extrabold tracking-tight text-foreground md:text-5xl'>{course.title}</h1>
            <p className='text-lg leading-relaxed text-muted-foreground'>
              {course.shortDescription || 'Master this topic with expert-led lessons and practical exercises.'}
            </p>
            <div className='flex items-center gap-4 text-sm font-medium'>
              <div className='flex items-center gap-1.5'>
                <Crown className='size-5 text-primary' />
                <span>By {creatorName}</span>
              </div>
              <div className='flex items-center gap-1.5'>
                <BookOpen className='size-5 text-muted-foreground' />
                <span>{totalLessons} Lessons</span>
              </div>
            </div>
          </div>

          <div className='flex items-center justify-center lg:justify-end'>
            <div className='border-default-200/50 w-full max-w-md overflow-hidden rounded-3xl border bg-background shadow-xl'>
              <div className='bg-default-100 aspect-video w-full'>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className='h-full w-full object-cover' alt={course.title} src={imageUrl} />
              </div>
              <div className='p-6'>
                <div className='mb-6 flex items-baseline gap-2'>
                  <span className='text-3xl font-extrabold'>{displayPrice}</span>
                </div>

                <Suspense fallback={<EnrollmentSkeleton />}>
                  <EnrollmentSection courseId={course.id} />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className='mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 py-16 lg:grid-cols-3 lg:px-6'>
        {/* Left Col (About & Curriculum) */}
        <div className='space-y-12 lg:col-span-2'>
          <section>
            <h2 className='mb-6 text-2xl font-bold tracking-tight'>About This Course</h2>
            <div className='border-default-200/50 rounded-2xl border bg-background/50 p-6 shadow-sm sm:p-8'>
              {course.description ? (
                <HtmlContent className='max-w-none' html={course.description} />
              ) : (
                <p className='text-muted-foreground'>No full description provided.</p>
              )}
            </div>
          </section>

          <section>
            <h2 className='mb-6 text-2xl font-bold tracking-tight'>Course Curriculum</h2>
            <div className='space-y-4'>
              {course.modules.length > 0 ? (
                course.modules.map((module: PublicModule, i: number) => (
                  <div key={module.id} className='border-default-200/50 rounded-2xl border bg-background/50 shadow-sm'>
                    <div className='border-default-200/50 flex items-center justify-between border-b bg-muted/40 p-5'>
                      <h3 className='font-semibold'>
                        <span className='mr-3 text-primary opacity-80'>Module {i + 1}</span>
                        {module.title}
                      </h3>
                      <span className='text-sm text-muted-foreground'>{module.lessons.length} lessons</span>
                    </div>
                    <div className='divide-default-200/50 divide-y'>
                      {module.lessons.map((lesson: PublicLesson, _idx: number) => (
                        <div
                          key={lesson.id}
                          className='flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/30'
                        >
                          {lesson.hasVideo ? (
                            <PlayCircle className='size-5 shrink-0 text-primary/60' />
                          ) : (
                            <BookOpen className='size-5 shrink-0 text-muted-foreground/60' />
                          )}
                          <span className='flex-1 text-sm font-medium'>{lesson.title}</span>
                        </div>
                      ))}
                      {module.lessons.length === 0 && (
                        <div className='px-5 py-4 text-sm text-muted-foreground'>No lessons added yet.</div>
                      )}
                    </div>
                  </div>
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
            <h3 className='mb-4 text-lg font-bold'>Your Instructor</h3>
            <div className='border-default-200/50 rounded-2xl border bg-background p-6 shadow-sm'>
              <div className='flex items-center gap-4'>
                <div className='flex size-14 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary'>
                  {creator?.firstName?.[0] || 'I'}
                </div>
                <div>
                  <div className='font-semibold'>{creatorName}</div>
                  <div className='text-sm text-muted-foreground'>Course Creator</div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
