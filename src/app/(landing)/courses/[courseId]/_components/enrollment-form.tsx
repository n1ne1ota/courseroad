'use client';

import { startTransition, useActionState } from 'react';

import { Button } from '@courseroad/kurume-ui';
import { Loader2 } from 'lucide-react';

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
      <Button className='relative w-full font-bold' type='submit' disabled={isPending} size='lg' variant='primary'>
        {isPending ? (
          <span className='flex items-center gap-2'>
            <Loader2 className='size-4 animate-spin' />
            Enrolling...
          </span>
        ) : (
          'Enroll Now'
        )}
      </Button>
      {errorMessage && <p className='mt-2 text-sm font-medium text-destructive'>{errorMessage}</p>}
    </form>
  );
}
