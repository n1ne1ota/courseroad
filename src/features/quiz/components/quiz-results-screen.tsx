'use client';

import type { JSX } from 'react';
import { memo, useState } from 'react';

import { Button, Card, CardContent, CardFooter, CardHeader, CardTitle } from '@courseroad/kurume-ui';
import { HtmlContent } from '@courseroad/kurume-ui/editor';
import { CheckCircle2Icon, ChevronDownIcon, CircleXIcon, RotateCcwIcon, TrophyIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

import { ShareButton } from '@/components/shared/share-button';

import type { QuestionResult } from '@/features/quiz/submission-types';

interface ResultsScreenProps {
  onBack: () => void;
  onRetake: () => void;
  passed: boolean | undefined;
  passingScore: number | null;
  results: QuestionResult[] | undefined;
  score: number;
  showCorrectAnswers: boolean;
  total: number;
}

export const ResultsScreen = memo(function ResultsScreen({
  onBack,
  onRetake,
  passed,
  passingScore,
  results,
  score,
  showCorrectAnswers,
  total
}: ResultsScreenProps): JSX.Element {
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  const correctCount = results?.filter(r => r.correct).length ?? score;
  const incorrectCount = total - correctCount;
  const [reviewExpanded, setReviewExpanded] = useState(false);

  return (
    <div className='space-y-5'>
      {/* Score hero + stats — bento row */}
      <div className='grid gap-4 lg:grid-cols-5'>
        {/* Score hero card (3/5 width) */}
        <Card className='lg:col-span-3'>
          <CardContent className='pt-8 pb-6 text-center'>
            <div className='mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10'>
              <TrophyIcon className='h-10 w-10 text-primary' />
            </div>

            <h2 className='text-2xl font-bold tracking-tight'>Quiz Complete!</h2>
            <p className='mt-1 text-muted-foreground'>Here&apos;s how you did</p>

            <div className='mt-6 flex flex-col items-center'>
              <span className='text-6xl font-extrabold tracking-tight tabular-nums'>
                {percentage}
                <span className='text-3xl font-semibold text-muted-foreground'>%</span>
              </span>
              <span className='mt-1 text-sm text-muted-foreground'>
                {score} out of {total} correct
              </span>
            </div>

            {passingScore !== null && passed !== undefined && (
              <div className='mt-4 flex justify-center'>
                {passed ? (
                  <span className='inline-flex items-center gap-1.5 rounded-full bg-green-100 px-4 py-1.5 text-sm font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400'>
                    <CheckCircle2Icon className='h-4 w-4' />
                    Passed — required {passingScore}%
                  </span>
                ) : (
                  <span className='inline-flex items-center gap-1.5 rounded-full bg-red-100 px-4 py-1.5 text-sm font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-400'>
                    <CircleXIcon className='h-4 w-4' />
                    Not Passed — required {passingScore}%
                  </span>
                )}
              </div>
            )}

            {/* Progress bar */}
            <div className='mx-auto mt-6 max-w-xs'>
              <div className='h-2.5 w-full overflow-hidden rounded-full bg-muted'>
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    percentage >= 80 ? 'bg-green-500' : percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className='flex flex-wrap justify-center gap-3 pb-6'>
            <ShareButton
              shareData={{
                text: `Just completed a quiz on Courseroad. Check it out!`,
                title: `I scored ${percentage}% on the quiz!`,
                url: typeof window !== 'undefined' ? window.location.href : ''
              }}
              label='Share Score'
              variant='outline'
            />
            <Button variant='outline' onClick={onBack}>
              Back to Quizzes
            </Button>
            <Button variant='primary' onClick={onRetake}>
              <RotateCcwIcon className='mr-2 h-4 w-4' />
              Try Again
            </Button>
          </CardFooter>
        </Card>

        {/* Stats card (2/5 width) */}
        <Card className='lg:col-span-2'>
          <CardHeader>
            <CardTitle className='text-sm font-semibold'>Performance Summary</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-muted-foreground'>Correct</span>
              <span className='text-sm font-semibold text-green-600 dark:text-green-400'>{correctCount}</span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-muted-foreground'>Incorrect</span>
              <span className='text-sm font-semibold text-red-600 dark:text-red-400'>{incorrectCount}</span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-muted-foreground'>Total Questions</span>
              <span className='text-sm font-semibold'>{total}</span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-muted-foreground'>Accuracy</span>
              <span className='text-sm font-semibold'>{percentage}%</span>
            </div>

            {/* Per-question status strip */}
            {results && results.length > 0 && (
              <div className='pt-2'>
                <p className='mb-2 text-xs font-medium text-muted-foreground'>Question Breakdown</p>
                <div className='flex flex-wrap gap-1'>
                  {results.map((r, i) => (
                    <div
                      key={r.questionId}
                      className={`flex h-7 w-7 items-center justify-center rounded-md text-xs font-semibold ${
                        r.correct
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Answer review (collapsible) */}
      {showCorrectAnswers && results && results.length > 0 && (
        <Card>
          <CardHeader>
            <button
              className='flex w-full items-center justify-between text-left'
              type='button'
              onClick={() => setReviewExpanded(prev => !prev)}
            >
              <CardTitle className='text-sm font-semibold'>Answer Review</CardTitle>
              <ChevronDownIcon
                className={`h-4 w-4 text-muted-foreground transition-transform ${reviewExpanded ? 'rotate-180' : ''}`}
              />
            </button>
          </CardHeader>
          <AnimatePresence initial={false}>
            {reviewExpanded && (
              <motion.div
                style={{ overflow: 'hidden' }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                initial={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <CardContent className='space-y-3 pt-0'>
                  {results.map((result, i) => (
                    <div
                      key={result.questionId}
                      className={`rounded-xl border p-4 ${
                        result.correct
                          ? 'border-green-200 dark:border-green-900/50'
                          : 'border-red-200 dark:border-red-900/50'
                      }`}
                    >
                      <div className='flex items-start gap-3'>
                        {result.correct ? (
                          <CheckCircle2Icon className='mt-0.5 h-5 w-5 shrink-0 text-green-500' />
                        ) : (
                          <CircleXIcon className='mt-0.5 h-5 w-5 shrink-0 text-red-500' />
                        )}
                        <div className='flex-1 space-y-1.5'>
                          <p className='text-xs font-medium text-muted-foreground'>Question {i + 1}</p>
                          <HtmlContent className='text-sm font-medium' html={result.prompt} />
                          {!result.correct && result.correctTexts.length > 0 && (
                            <p className='text-sm text-muted-foreground'>
                              <span className='font-medium text-foreground'>Correct: </span>
                              {result.correctTexts.join(', ')}
                            </p>
                          )}
                          {result.explanation && (
                            <div className='mt-2 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground'>
                              <span className='font-medium text-foreground'>Explanation: </span>
                              <HtmlContent className='inline' html={result.explanation} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      )}
    </div>
  );
});
