'use client';

import { startTransition, useActionState } from 'react';

import { Button, Spinner } from '@courseroad/iota-ui';

import { enrollInCourse } from '@/features/course/actions/learning-actions';

import type { ActionState } from '@/types/action.types';

interface EnrollmentFormProps {
  courseId: string;
}

export function EnrollmentForm({ courseId }: EnrollmentFormProps) {
  // useActionState requires an initial state. We'll pass a simple object.
  const [state, dispatch, isPending] = useActionState(enrollInCourse, { success: false } as ActionState<void>);

  const onSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(() => {
      dispatch({ courseId });
    });
  };

  const errorMessage = state.error;

  return (
    <form onSubmit={onSubmit}>
      <Button
        type='submit'
        fullWidth
        color='brand'
        disabled={isPending}
        isLoading={isPending}
        size='lg'
        spinner={<Spinner color='current' size='sm' />}
      >
        {isPending ? 'Enrolling...' : 'Enroll Now'}
      </Button>
      {errorMessage ? <p className='mt-2 text-sm font-medium text-destructive'>{errorMessage}</p> : null}
    </form>
  );
}
