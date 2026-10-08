'use client';

import type { JSX } from 'react';
import { startTransition, useActionState, useCallback, useEffect, useRef, useState } from 'react';

import { useRouter } from 'next/navigation';

import type { FieldValues } from 'react-hook-form';
import type { z } from 'zod';

import { showErrorToast, showSuccessToast } from '@courseroad/iota-ui';
import { Button, StatusBadge, Tabs } from '@courseroad/kurume-ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { SaveIcon } from 'lucide-react';
import { FormProvider, useForm } from 'react-hook-form';

import { UnsavedChangesAlert } from '@/components/shared/unsaved-changes-alert';

import { updateQuiz } from '@/features/quiz/actions/quiz-actions';
import { updateQuizSchema } from '@/features/quiz/schemas';

import type { Quiz, QuizOption, QuizQuestion } from '@/features/quiz/editor-types';

import { QuizDetails } from './quiz-details';
import { QuizPublishPage } from './quiz-publish-page';
import { QuizQuestionsBuilder } from './quiz-questions-builder';

type QuizWithQuestions = Quiz & {
  questions: (QuizQuestion & {
    options: QuizOption[];
  })[];
};

interface QuizEditorProps {
  quiz: QuizWithQuestions;
}

export type QuizEditorTab = 'details' | 'questions' | 'publish';

export function QuizEditor({ quiz }: QuizEditorProps): JSX.Element {
  const [activeTab, setActiveTab] = useState<QuizEditorTab>('details');
  const [questionsFormDirty, setQuestionsFormDirty] = useState(false);
  const [questionsFormPending, setQuestionsFormPending] = useState(false);
  const router = useRouter();

  const [state, dispatch, isPending] = useActionState(updateQuiz, {
    success: false
  } as Awaited<ReturnType<typeof updateQuiz>>);

  const form = useForm<z.input<typeof updateQuizSchema>>({
    defaultValues: {
      allowedAttempts: quiz.allowedAttempts,
      description: quiz.description ?? '',
      id: quiz.id,
      passingScore: quiz.passingScore,
      showCorrectAnswers: quiz.showCorrectAnswers ?? true,
      showTimer: quiz.showTimer ?? true,
      shuffleQuestions: quiz.shuffleQuestions ?? false,
      thumbnailUrl: quiz.thumbnailUrl ?? null,
      timeLimit: quiz.timeLimit,
      title: quiz.title
    },
    resolver: zodResolver(updateQuizSchema)
  });

  useEffect(() => {
    if (state.success) {
      showSuccessToast('Quiz updated successfully');
      form.reset(form.getValues());
      router.refresh();
    } else if (state.error) {
      showErrorToast(state.error);
    }
  }, [state, router, form]);

  const handleDetailsSubmit = (values: FieldValues) => {
    startTransition(() => {
      dispatch(values as z.input<typeof updateQuizSchema>);
    });
  };

  const hasUnsavedChanges = form.formState.isDirty || questionsFormDirty;

  const handleQuestionsFormDirtyChange = useCallback((isDirty: boolean) => {
    setQuestionsFormDirty(isDirty);
  }, []);

  const handleQuestionsFormPendingChange = useCallback((pending: boolean) => {
    setQuestionsFormPending(pending);
  }, []);

  const isSaving = isPending || questionsFormPending;

  // Track when unsaved changes first occurred
  const dirtyTimestampRef = useRef<Date | null>(null);
  const [dirtyTimestamp, setDirtyTimestamp] = useState<string | null>(null);

  useEffect(() => {
    if (hasUnsavedChanges && !dirtyTimestampRef.current) {
      const now = new Date();
      dirtyTimestampRef.current = now;

      setDirtyTimestamp(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } else if (!hasUnsavedChanges) {
      dirtyTimestampRef.current = null;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clearing timestamp when form returns to clean state
      setDirtyTimestamp(null);
    }
  }, [hasUnsavedChanges]);

  return (
    <FormProvider {...form}>
      <UnsavedChangesAlert isDirty={hasUnsavedChanges} />

      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Quiz Editor</h1>
            <p className='text-muted-foreground'>{quiz.title || 'Untitled Quiz'}</p>
          </div>
        </div>

        <div className='w-full'>
          <div className='flex w-full items-center justify-between'>
            <Tabs<QuizEditorTab>
              className='w-auto'
              options={[
                { label: 'Details', value: 'details' },
                { label: 'Questions', value: 'questions' },
                { label: 'Publish', value: 'publish' }
              ]}
              tabClassName='px-4'
              value={activeTab}
              onValueChange={setActiveTab}
            />
            {activeTab !== 'publish' && (
              <div className='flex items-center gap-3'>
                <StatusBadge variant='warning' visible={hasUnsavedChanges && !!dirtyTimestamp}>
                  Unsaved changes since {dirtyTimestamp}
                </StatusBadge>
                <Button
                  type='submit'
                  disabled={isSaving || !hasUnsavedChanges}
                  form={activeTab === 'questions' ? 'quiz-questions-form' : 'quiz-details-form'}
                  isLoading={isSaving}
                  variant='secondary'
                >
                  {isSaving ? (
                    'Saving Changes'
                  ) : (
                    <>
                      <SaveIcon className='mr-2 h-4 w-4' />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Details tab */}
          {activeTab === 'details' && (
            <div className='mt-6'>
              <QuizDetails onSubmit={handleDetailsSubmit} />
            </div>
          )}

          {/* Questions tab */}
          {activeTab === 'questions' && (
            <div className='mt-6'>
              <QuizQuestionsBuilder
                initialQuestions={quiz.questions}
                quizId={quiz.id}
                onDirtyChange={handleQuestionsFormDirtyChange}
                onPendingChange={handleQuestionsFormPendingChange}
              />
            </div>
          )}

          {/* Publish tab */}
          {activeTab === 'publish' && (
            <div className='mt-6'>
              <QuizPublishPage quiz={quiz} />
            </div>
          )}
        </div>
      </div>
    </FormProvider>
  );
}
