import 'server-only';

import type { JSX } from 'react';
import { Suspense } from 'react';

import { shuffle } from '@/lib/utils/random';

import { PageSkeleton } from '@/components/layout/page-skeleton';

import { QuizPlayer } from '@/features/quiz/components/quiz-player';
import { loadLearnerQuizPlayerFetcher } from '@/features/quiz/server/loaders/organization-learner-quizzes-quiz-detail';
import { readForPage } from '@/server/auth/page-access';

import type { QuizQuestion } from '@/features/quiz/quiz-player-types';

// ----------------------------------------------------
// Learner Quiz Take View
// ----------------------------------------------------

async function LearnerQuizPlayerFetcher({ quizId }: { quizId: string }) {
  const { quiz, attemptsRemaining } = await readForPage(() => loadLearnerQuizPlayerFetcher({ quizId }));

  if (quiz.questions.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center p-8 text-center'>
        <h3 className='text-lg font-medium'>Quiz Not Ready</h3>
        <p className='mt-2 text-sm text-muted-foreground'>This quiz does not have any questions yet.</p>
      </div>
    );
  }

  if (attemptsRemaining === 0) {
    return (
      <div className='flex flex-col items-center justify-center p-8 text-center'>
        <h3 className='text-lg font-medium'>No Attempts Remaining</h3>
        <p className='mt-2 text-sm text-muted-foreground'>
          You have used all {quiz.allowedAttempts} allowed attempt
          {quiz.allowedAttempts !== 1 ? 's' : ''} for this quiz.
        </p>
      </div>
    );
  }

  let questions: QuizQuestion[] = quiz.questions;
  if (quiz.shuffleQuestions) {
    questions = shuffle(questions).map((q: QuizQuestion) => ({
      ...q,
      options: shuffle(q.options)
    }));
  }

  return (
    <QuizPlayer
      attemptsRemaining={attemptsRemaining}
      passingScore={quiz.passingScore}
      quiz={{ ...quiz, questions }}
      showCorrectAnswers={quiz.showCorrectAnswers}
      timeLimit={quiz.timeLimit}
    />
  );
}

export function LearnerQuizTakeView({ quizId }: { quizId: string }): JSX.Element {
  return (
    <div className='px-4 lg:px-6'>
      <Suspense fallback={<PageSkeleton />}>
        <LearnerQuizPlayerFetcher quizId={quizId} />
      </Suspense>
    </div>
  );
}
