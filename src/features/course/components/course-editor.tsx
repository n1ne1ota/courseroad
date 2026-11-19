'use client';

import type { JSX } from 'react';
import { startTransition, useActionState, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import type { z } from 'zod';

import { Button, showErrorToast, showSuccessToast, Tabs } from '@courseroad/kurume-ui';

import { zodResolver } from '@hookform/resolvers/zod';
import { SaveIcon } from 'lucide-react';
import { useQueryState } from 'nuqs';
import { FormProvider, useForm } from 'react-hook-form';

import { UnsavedChangesAlert } from '@/components/shared/unsaved-changes-alert';

import { updateCourse, updatePlatformCourse } from '@/features/course/actions/course-actions';
import {
  mutateOrganizationCurriculum,
  mutatePlatformCurriculum,
  syncOrganizationVideoStatuses,
  syncPlatformVideoStatuses
} from '@/features/course/actions/curriculum-actions';
import { CourseDetails } from '@/features/course/components/course-details';
import { updateCourseSchema } from '@/features/course/schemas/course-schemas';

import type { PublishingTarget } from '@/features/course/lib/publishing';
import type { Course, Lesson, Module } from '@/features/course/types/course-types';
import type { CurriculumActions, LessonEditorHandle } from '@/features/course/types/curriculum-types';

import { CourseCurriculumEditor } from './course-curriculum-editor';
import { CoursePublishing } from './course-publishing';

type CourseWithCurriculum = Course & {
  modules: (Module & {
    lessons: Lesson[];
  })[];
};

interface CourseEditorProps {
  course: CourseWithCurriculum;
  scope?: 'organization' | 'platform';
}

export type CourseEditorTab = 'details' | 'curriculum' | 'publish';

const ORGANIZATION_TABS = [
  { label: 'Details', value: 'details' as const },
  { label: 'Curriculum', value: 'curriculum' as const },
  { label: 'Publish', value: 'publish' as const }
];

export function CourseEditor({ course, scope = 'organization' }: CourseEditorProps): JSX.Element {
  const [activeTab, setActiveTab] = useState<CourseEditorTab>('details');
  const [statusOverride, setStatusOverride] = useState<{ source: Course['status']; value: Course['status'] } | null>(
    null
  );
  const status = statusOverride?.source === course.status ? statusOverride.value : course.status;
  const updateStatus = useCallback(
    (value: Course['status']) => setStatusOverride({ source: course.status, value }),
    [course.status]
  );
  const [publishingBusy, setPublishingBusy] = useState(false);
  const [, setLessonId] = useQueryState('lessonId');
  const readOnly = status !== 'Draft';
  const router = useRouter();
  const pathname = usePathname();
  const curriculum = useRef<LessonEditorHandle>(null);
  const [curriculumDirty, setCurriculumDirty] = useState(false);
  const curriculumActions = useMemo<CurriculumActions>(() => {
    const action = scope === 'platform' ? mutatePlatformCurriculum : mutateOrganizationCurriculum;
    const syncAction = scope === 'platform' ? syncPlatformVideoStatuses : syncOrganizationVideoStatuses;
    return {
      execute: input =>
        new Promise((resolve, reject) => {
          startTransition(() => {
            void action(input).then(resolve, reject);
          });
        }),
      // Polled in the background, so it stays outside a transition and never marks the editor as pending.
      syncVideoStatuses: courseId => syncAction({ courseId })
    };
  }, [scope]);
  const switchTab = async (tab: CourseEditorTab) => {
    if (publishingBusy || isPending) return;
    if (tab === activeTab) return;
    if (activeTab !== 'curriculum') {
      setActiveTab(tab);
      return;
    }
    if ((await curriculum.current?.flush()) ?? true) {
      setActiveTab(tab);
    }
  };
  const [state, dispatch, isPending] = useActionState(scope === 'platform' ? updatePlatformCourse : updateCourse, {
    success: false
  });

  const form = useForm<z.input<typeof updateCourseSchema>>({
    defaultValues: {
      category: course.category || '',
      description: course.description || '',
      duration: course.duration ?? undefined,
      fileKey: course.fileKey || '',
      id: course.id,
      level: course.level || undefined,
      price: course.price || 0,
      shortDescription: course.shortDescription || '',
      slug: course.slug,
      introVideoUrl: course.introVideoUrl || '',
      introVideoGuid: course.introVideoGuid || '',
      introVideoFileName: course.introVideoFileName || '',
      introVideoFileSize: course.introVideoFileSize ?? 0,
      title: course.title
    },
    resolver: zodResolver(updateCourseSchema)
  });

  // With cacheComponents, a revisited route keeps its previous action state and re-runs effects.
  // Only react to results we have not handled yet, otherwise stale `success` re-toasts on open.
  const handledState = useRef(state);

  useEffect(() => {
    if (handledState.current === state) return;
    handledState.current = state;

    if (state.success) {
      showSuccessToast('Course updated successfully');
      // Reset form dirty state after successful save
      form.reset(form.getValues());
      router.refresh();
    } else if (state.error) {
      if (state.fieldErrors && Object.keys(state.fieldErrors).length > 0) {
        Object.entries(state.fieldErrors).forEach(([key, messages]) => {
          // @ts-expect-error: key type mismatch often happens with nested forms
          form.setError(key, { message: messages?.join(', ') || '' });
        });
      } else {
        showErrorToast(state.error);
      }
    }
  }, [state, router, form]);

  const onSubmit = (values: z.input<typeof updateCourseSchema>) => {
    if (readOnly || publishingBusy) return;
    startTransition(() => {
      dispatch(values);
    });
  };

  const hasUnsavedChanges = form.formState.isDirty;
  const navigateToCheck = async (target: PublishingTarget) => {
    if (publishingBusy || isPending) return;
    if (target.tab === 'curriculum' && target.lessonId) await setLessonId(target.lessonId);
    await switchTab(target.tab);
    if (target.tab === 'details')
      requestAnimationFrame(() => {
        const field =
          document.getElementById(`course-${target.field}`) ??
          document.querySelector<HTMLElement>(`label[for="course-${target.field}"]`)?.parentElement;
        field?.scrollIntoView({ block: 'center', behavior: 'smooth' });
        if (field?.matches('input, button, select, textarea')) field.focus();
        else field?.querySelector<HTMLElement>('input, button, [contenteditable="true"]')?.focus();
      });
  };

  return (
    <FormProvider {...form}>
      <UnsavedChangesAlert isDirty={hasUnsavedChanges || curriculumDirty} />
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Course Editor</h1>
            <p className='text-muted-foreground'>{course.title}</p>
          </div>
          {/* Announcements are managed on their own page, composed by the route from the blog feature. */}
          <Link
            className='text-sm font-medium underline-offset-4 hover:underline'
            href={`${pathname}/announcements` as never}
          >
            Announcements
          </Link>
        </div>

        <div className='w-full'>
          <div className='flex w-full items-center justify-between'>
            <Tabs<CourseEditorTab>
              className='w-auto'
              options={ORGANIZATION_TABS}
              tabClassName='px-4'
              value={activeTab}
              onValueChange={switchTab}
            />
            <div className='flex items-center gap-2'>
              {activeTab === 'details' && !readOnly && (
                <Button
                  type='submit'
                  disabled={isPending || !hasUnsavedChanges}
                  form='course-details-form'
                  isLoading={isPending}
                >
                  {isPending ? (
                    'Saving Changes'
                  ) : (
                    <>
                      <SaveIcon className='mr-2 h-4 w-4' />
                      Save Changes
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          <form
            className='mt-6'
            id='course-details-form'
            hidden={activeTab !== 'details'}
            onSubmit={form.handleSubmit(onSubmit)}
          >
            {readOnly && (
              <p className='mb-4' role='status'>
                This course is read-only.{' '}
                {status === 'Published'
                  ? 'Unpublish it from the Publish tab to edit.'
                  : 'Archived courses cannot be edited.'}
              </p>
            )}
            <fieldset disabled={readOnly || isPending || publishingBusy}>
              <CourseDetails disabled={readOnly || isPending || publishingBusy} />
            </fieldset>
          </form>

          <div className='mt-6' hidden={activeTab !== 'curriculum'}>
            <CourseCurriculumEditor
              ref={curriculum}
              actions={curriculumActions}
              courseId={course.id}
              modules={course.modules}
              readOnly={readOnly || publishingBusy}
              scope={scope}
              onDirtyChange={setCurriculumDirty}
            />
          </div>

          {activeTab === 'publish' && (
            <div className='mt-6'>
              <CoursePublishing
                key={`${scope}-${course.id}`}
                courseId={course.id}
                dirty={hasUnsavedChanges || curriculumDirty}
                saving={isPending}
                scope={scope}
                onBusyChange={setPublishingBusy}
                onNavigate={navigateToCheck}
                onStatusChange={updateStatus}
              />
            </div>
          )}
        </div>
      </div>
    </FormProvider>
  );
}
