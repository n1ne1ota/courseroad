import type { JSX } from 'react';

import type { Metadata } from 'next';

import { PublicQuizExperience } from '@/features/quiz/components/public-quiz-experience';
import { loadTryQuizPage } from '@/features/quiz/server/loaders/public-try-quiz-quiz';
import { readForPage } from '@/server/auth/page-access';

export const metadata: Metadata = {
  description: 'Take this quiz for free — no account required.',
  title: 'Try a Quiz'
};

export default async function TryQuizPage(props: { params: Promise<{ quizId: string }> }): Promise<JSX.Element> {
  const { quiz } = await readForPage(() => loadTryQuizPage(props));

  return (
    <div className='mx-auto w-full max-w-4xl px-4 py-10 lg:px-6'>
      {quiz.questions.length === 0 ? (
        <div className='flex flex-col items-center justify-center p-8 text-center'>
          <h3 className='text-lg font-medium'>Quiz Not Ready</h3>
          <p className='mt-2 text-sm text-muted-foreground'>This quiz does not have any questions yet.</p>
        </div>
      ) : (
        <PublicQuizExperience
          attemptsRemaining={null}
          passingScore={quiz.passingScore}
          quiz={{ ...quiz }}
          showCorrectAnswers={quiz.showCorrectAnswers}
          timeLimit={quiz.timeLimit}
        />
      )}
    </div>
  );
}
