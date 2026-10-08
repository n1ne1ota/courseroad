'use client';

import type { JSX } from 'react';
import { startTransition, useActionState, useEffect, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { createCourse } from '@/features/course/actions/course-actions';
import { createCourseSchema } from '@/features/course/schemas';
import { showErrorToast } from '@courseroad/iota-ui';
import { Button } from '@courseroad/kurume-ui';
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

export function CreatorCourseModal(): JSX.Element {
  const [open, setOpen] = useState(false);
  const [state, dispatch, isPending] = useActionState(createCourse, {
    success: false
  });

  const form = useForm({
    defaultValues: {
      title: ''
    },
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
      <DialogTrigger asChild>
        <Button>
          <Plus className='mr-2 h-4 w-4' />
          Create Course
        </Button>
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
              <p className='text-sm text-red-500'>{form.formState.errors.title.message}</p>
            )}
          </Field>
          <DialogFooter>
            <Button type='submit' disabled={!form.formState.isValid || isPending} isLoading={isPending}>
              {isPending ? (
                'Creating'
              ) : (
                <>
                  <Plus className='mr-2 h-4 w-4' />
                  Create Course
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
