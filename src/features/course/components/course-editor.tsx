'use client';

import type { JSX } from 'react';
import { startTransition, useActionState, useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import type { z } from 'zod';

import { showErrorToast, showSuccessToast } from '@courseroad/iota-ui';
import { Button, Tabs } from '@courseroad/kurume-ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { SaveIcon } from 'lucide-react';
import { FormProvider, useForm } from 'react-hook-form';

import { UnsavedChangesAlert } from '@/components/shared/unsaved-changes-alert';

import { updateCourse } from '@/features/course/actions/course-actions';
import { CourseDetails } from '@/features/course/components/course-details';
import { updateCourseSchema } from '@/features/course/schemas';

import type { Course, Lesson, Module } from '@/features/course/types';

import { CourseCurriculumEditor } from './course-curriculum-editor';

type CourseWithCurriculum = Course & {
  modules: (Module & {
    lessons: Lesson[];
  })[];
};

interface CourseEditorProps {
  course: CourseWithCurriculum;
}

export type CourseEditorTab = 'details' | 'curriculum' | 'publish';

export function CourseEditor({ course }: CourseEditorProps): JSX.Element {
  const [activeTab, setActiveTab] = useState<CourseEditorTab>('details');
  const router = useRouter();
  const [state, dispatch, isPending] = useActionState(updateCourse, {
    success: false
  });

  const form = useForm<z.input<typeof updateCourseSchema>>({
    defaultValues: {
      category: course.category || '',
      description: course.description || '',
      duration: course.duration || 0,
      fileKey: course.fileKey || '',
      id: course.id,
      level: course.level || undefined,
      price: course.price || 0,
      shortDescription: course.shortDescription || '',
      slug: course.slug,
      status: course.status,
      title: course.title
    },
    resolver: zodResolver(updateCourseSchema)
  });

  useEffect(() => {
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
    startTransition(() => {
      dispatch(values);
    });
  };

  const hasUnsavedChanges = form.formState.isDirty;

  return (
    <FormProvider {...form}>
      <UnsavedChangesAlert isDirty={hasUnsavedChanges} />
      <form className='space-y-6' onSubmit={form.handleSubmit(onSubmit)}>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Course Editor</h1>
            <p className='text-muted-foreground'>{course.title}</p>
          </div>
        </div>

        <div className='w-full'>
          <div className='flex w-full items-center justify-between'>
            <Tabs<CourseEditorTab>
              className='w-auto'
              options={[
                { label: 'Details', value: 'details' },
                { label: 'Curriculum', value: 'curriculum' },
                { label: 'Publish', value: 'publish' }
              ]}
              tabClassName='px-4'
              value={activeTab}
              onValueChange={setActiveTab}
            />
            <div className='flex items-center gap-2'>
              <Button type='submit' disabled={isPending || !hasUnsavedChanges} isLoading={isPending}>
                {isPending ? (
                  'Saving'
                ) : (
                  <>
                    <SaveIcon className='mr-2 h-4 w-4' />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>

          {activeTab === 'details' && (
            <div className='mt-6'>
              <CourseDetails />
            </div>
          )}

          {activeTab === 'curriculum' && (
            <div className='mt-6'>
              <CourseCurriculumEditor courseId={course.id} modules={course.modules} />
            </div>
          )}

          {activeTab === 'publish' && (
            <div className='mt-6'>
              <div className='rounded-lg border border-dashed bg-muted/20 p-8 text-center'>
                <h3 className='text-lg font-medium'>Publishing Options</h3>
                <p className='mt-2 text-muted-foreground'>Review checklist and publish your course.</p>
              </div>
            </div>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
