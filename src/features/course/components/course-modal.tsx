'use client';

import type { JSX } from 'react';
import { startTransition, useActionState, useEffect, useState } from 'react';

import { Button, showErrorToast } from '@courseroad/kurume-ui';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@courseroad/kurume-ui';
import { Field, FieldLabel } from '@courseroad/kurume-ui';
import { Input } from '@courseroad/kurume-ui';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { createCourse, createPlatformCourse } from '@/features/course/actions/course-actions';
import { createCourseSchema } from '@/features/course/schemas/course-schemas';

export function CreatorCourseModal({
  scope = 'organization',
  triggerLabel = 'Create course'
}: { scope?: 'organization' | 'platform'; triggerLabel?: string } = {}): JSX.Element {
  const [open, setOpen] = useState(false);
  const [state, dispatch, isPending] = useActionState(scope === 'platform' ? createPlatformCourse : createCourse, {
    success: false
  });

  const form = useForm({
    defaultValues: {
      title: ''
    },
    mode: 'onChange',
    resolver: zodResolver(createCourseSchema.pick({ title: true }))
  });

  useEffect(() => {
    if (!state.success) {
      if (state.fieldErrors) {
        Object.entries(state.fieldErrors).forEach(([field, messages]) => {
          form.setError(field as Parameters<typeof form.setError>[0], {
            message: messages?.join(', ') || '',
            type: 'server'
          });
        });
      }

      if (state.error && (!state.fieldErrors || Object.keys(state.fieldErrors).length === 0)) {
        showErrorToast(state.error);
      }
    }
  }, [state, form]);

  const onSubmit = (values: { title: string }) => {
    startTransition(() => {
      dispatch(values);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className='size-4' />
        {triggerLabel}
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Create Course</DialogTitle>
          <DialogDescription>Enter the title for your new course to get started.</DialogDescription>
        </DialogHeader>
        <form className='space-y-4' onSubmit={form.handleSubmit(onSubmit)}>
          <Field>
            <FieldLabel htmlFor='title'>Title</FieldLabel>
            <Input id='title' {...form.register('title')} />
            {form.formState.errors.title && (
              <p className='text-sm text-destructive'>{form.formState.errors.title.message}</p>
            )}
          </Field>
          <DialogFooter>
            <Button type='submit' disabled={!form.formState.isValid || isPending} isLoading={isPending}>
              {isPending ? (
                'Creating'
              ) : (
                <>
                  <Plus className='size-4' />
                  Create course
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
