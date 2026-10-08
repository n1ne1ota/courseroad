'use client';

import type { JSX } from 'react';

import Link from 'next/link';

import { authClient, signInAnonymously } from '@/lib/auth/auth-client';
import { routes } from '@/lib/routes';

import { submitPublicQuizAnswers } from '@/features/quiz/actions/quiz-submission-actions';
import { QuizPlayer } from '@/features/quiz/components/quiz-player';
import { Alert, AlertDescription } from '@courseroad/kurume-ui';

import type { QuizPlayerProps } from '@/features/quiz/quiz-player-types';

type PublicQuizExperienceProps = Pick<
  QuizPlayerProps,
  'quiz' | 'passingScore' | 'showCorrectAnswers' | 'timeLimit' | 'attemptsRemaining'
>;

/**
 * Client wrapper around {@link QuizPlayer} for the public `/try-quiz` demo.
 *
 * Guests can take the quiz without an account; an anonymous session is created
 * on submit (via {@link signInAnonymously}) so the submission can be persisted
 * and later migrated to a real account. A banner nudges guests to sign up.
 */
export function PublicQuizExperience({
  quiz,
  passingScore,
  showCorrectAnswers,
  timeLimit,
  attemptsRemaining
}: PublicQuizExperienceProps): JSX.Element {
  const { data: session } = authClient.useSession();
  const isAnonymous = Boolean((session?.user as { isAnonymous?: boolean } | undefined)?.isAnonymous);

  /** Ensure a session exists before submitting; create a guest one if needed. */
  const ensureSession = async (): Promise<boolean> => {
    const { data } = await authClient.getSession();
    if (data?.session) return true;
    const result = await signInAnonymously();
    return result.success;
  };

  return (
    <div className='space-y-4'>
      {isAnonymous && (
        <Alert variant='default'>
          <AlertDescription>
            You are using a guest account. Your progress won&apos;t be saved permanently —{' '}
            <Link className='text-link font-medium' href={routes.signUp}>
              sign up
            </Link>{' '}
            to keep your results.
          </AlertDescription>
        </Alert>
      )}
      <QuizPlayer
        attemptsRemaining={attemptsRemaining}
        ensureSession={ensureSession}
        passingScore={passingScore}
        quiz={quiz}
        resultsBackHref={routes.home}
        showCorrectAnswers={showCorrectAnswers}
        submitAction={submitPublicQuizAnswers}
        timeLimit={timeLimit}
      />
    </div>
  );
}
