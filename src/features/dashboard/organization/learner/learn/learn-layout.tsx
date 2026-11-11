import 'server-only';

import type { ReactNode } from 'react';

import Link from 'next/link';

import { BookOpen, CheckCircle2, ChevronLeft, LayoutDashboard, PlayCircle } from 'lucide-react';

import { loadLearnLayout } from '@/features/course/server/loaders/organization-learner-learn-layout';
import { readForPage } from '@/server/auth/page-access';

import type { Lesson, Module } from '@/features/course/types';

type LearnLayoutProps = {
  children: ReactNode;
  courseId: string;
  slug: string;
};

export async function LearnLayout({ children, courseId, slug }: LearnLayoutProps) {
  const { course, completedLessonIds, orgRoutes } = await readForPage(() => loadLearnLayout({ courseId, slug }));

  return (
    <div className='flex h-dvh w-full overflow-hidden bg-background'>
      {/* Sidebar Navigation */}
      <aside className='border-default-200/50 flex w-80 shrink-0 flex-col border-r bg-muted/20 max-lg:hidden'>
        <div className='border-default-200/50 flex flex-col gap-4 border-b p-4'>
          <Link
            className='inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground'
            href={orgRoutes.dashboard}
          >
            <ChevronLeft className='size-4' />
            Back to Dashboard
          </Link>
          <h1 className='line-clamp-2 text-lg leading-tight font-bold'>{course.title}</h1>
        </div>

        <div className='flex-1 scrollbar-thin overflow-x-hidden overflow-y-auto p-4'>
          <div className='space-y-6'>
            {course.modules.map((module: Module & { lessons: Lesson[] }, i: number) => (
              <div key={module.id} className='space-y-2'>
                <h3 className='text-sm font-semibold text-foreground/80'>
                  Module {i + 1}: {module.title}
                </h3>
                <div className='flex flex-col gap-1'>
                  {module.lessons.map((lesson: Lesson) => {
                    const isCompleted = completedLessonIds.has(lesson.id);
                    return (
                      <Link
                        key={lesson.id}
                        className='group flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-muted/50'
                        href={orgRoutes.learnLesson(course.id, lesson.id)}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className='mt-0.5 size-4 shrink-0 text-success' />
                        ) : lesson.videoUrl ? (
                          <PlayCircle className='mt-0.5 size-4 shrink-0 text-muted-foreground/60' />
                        ) : (
                          <BookOpen className='mt-0.5 size-4 shrink-0 text-muted-foreground/60' />
                        )}
                        <span
                          className={`text-sm leading-snug font-medium ${isCompleted ? 'text-muted-foreground' : 'text-foreground'}`}
                        >
                          {lesson.title}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className='relative flex flex-1 flex-col overflow-y-auto px-4 py-6 sm:px-8'>
        <div className='mb-6 flex items-center justify-between lg:hidden'>
          <Link
            className='inline-flex items-center gap-2 rounded-lg border bg-background p-2 text-sm font-medium text-muted-foreground'
            href={orgRoutes.dashboard}
          >
            <LayoutDashboard className='size-4' />
          </Link>
          <div className='font-semibold'>{course.title}</div>
        </div>
        {children}
      </main>
    </div>
  );
}
