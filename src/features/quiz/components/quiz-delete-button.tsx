'use client';

import type { JSX } from 'react';
import { useTransition } from 'react';

import { Trash2Icon } from 'lucide-react';

import { deleteQuiz } from '@/features/quiz/actions/quiz-actions';
import { showErrorToast } from '@courseroad/iota-ui';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@courseroad/kurume-ui';

interface QuizDeleteButtonProps {
  quizId: string;
  quizTitle: string;
}

export function QuizDeleteButton({ quizId, quizTitle }: QuizDeleteButtonProps): JSX.Element {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteQuiz({ quizId });
      if (!result.success && result.error) showErrorToast(result.error);
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          className='rounded p-1 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive'
          type='button'
          disabled={isPending}
          aria-label='Delete quiz'
          onClick={e => e.preventDefault()}
        >
          <Trash2Icon className='h-4 w-4' />
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete &ldquo;{quizTitle}&rdquo;?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the quiz, all its questions, options, and learner submissions. This action
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            disabled={isPending}
            onClick={handleDelete}
          >
            {isPending ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
