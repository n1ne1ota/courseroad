import 'server-only';

import Link from 'next/link';

import { Button } from '@courseroad/kurume-ui';
import { HtmlContent } from '@courseroad/kurume-ui/editor';
import { CheckCircle2, ChevronRight } from 'lucide-react';

import { loadLessonView } from '@/features/course/server/loaders/organization-learner-learn-lesson';
import { VideoPlayer } from '@/features/media/video-player';
import { readForPage } from '@/server/auth/page-access';

type LessonViewProps = {
  courseId: string;
  lessonId: string;
  slug: string;
};

export async function LessonView({ courseId, lessonId, slug }: LessonViewProps) {
  const { lesson, isCompleted, nextLessonId, markCompleteAction, orgRoutes } = await readForPage(() =>
    loadLessonView({ courseId, lessonId, slug })
  );

  return (
    <div className='mx-auto w-full max-w-5xl animate-in duration-700 fade-in slide-in-from-bottom-4'>
      {lesson.videoUrl && (
        <div className='mb-8 overflow-hidden rounded-2xl border bg-black shadow-xl'>
          <VideoPlayer title={lesson.title} url={lesson.videoUrl} />
        </div>
      )}

      <div className='border-default-200/50 mb-10 flex flex-col items-start justify-between gap-6 border-b pb-8 sm:flex-row sm:items-end'>
        <div>
          <h1 className='text-3xl font-extrabold tracking-tight md:text-4xl'>{lesson.title}</h1>
          <div className='mt-2 flex items-center gap-2 text-sm text-muted-foreground'>
            <span className='font-medium text-foreground'>Module {lesson.module.order}</span>
            <span>&bull;</span>
            <span>{lesson.module.title}</span>
          </div>
        </div>

        <div className='flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center'>
          {!isCompleted ? (
            <form className='w-full sm:w-auto' action={markCompleteAction}>
              <Button className='w-full sm:w-auto' type='submit' variant='outline'>
                <CheckCircle2 className='mr-2 size-4 text-muted-foreground' />
                Mark as Complete
              </Button>
            </form>
          ) : (
            <div className='flex w-full items-center justify-center gap-2 rounded-lg border border-success/30 bg-success/10 px-4 py-2 text-sm font-semibold text-success sm:w-auto'>
              <CheckCircle2 className='size-4' />
              Completed
            </div>
          )}

          {nextLessonId && (
            <Button className='w-full sm:w-auto' asChild variant='primary'>
              <Link href={orgRoutes.learnLesson(courseId, nextLessonId)}>
                Next Lesson
                <ChevronRight className='ml-2 size-4' />
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className='prose prose-neutral dark:prose-invert max-w-none'>
        {lesson.description ? (
          <HtmlContent html={lesson.description} />
        ) : (
          <p className='text-muted-foreground italic'>No reading material provided for this lesson.</p>
        )}
      </div>
    </div>
  );
}
