'use client';

import type { JSX } from 'react';
import { memo, startTransition, useActionState, useCallback, useEffect, useRef, useState } from 'react';

import type { Route } from 'next';
import { usePathname, useRouter } from 'next/navigation';

import { Checkbox, showErrorToast, showWarningToast } from '@courseroad/iota-ui';
import { Button, Card, CardContent, CardFooter, CardHeader, CardTitle, Input, Label } from '@courseroad/kurume-ui';
import { HtmlContent } from '@courseroad/kurume-ui/editor';
import { ChevronLeftIcon, ChevronRightIcon, ClockIcon, SendIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

import { extractOrgSlug } from '@/lib/routes/org';

import { submitQuizAnswers } from '@/features/quiz/actions/quiz-submission-actions';
import { QuestionType } from '@/features/quiz/question-types';

import type { SubmitQuizResult } from '@/features/quiz/submission-types';
import type { ActionState } from '@/types/action.types';

import { useHighlightedPrompts } from '../hooks/use-highlighted-prompts';
import { formatTime, OPTION_LETTERS, stripLeadingTitle } from '../quiz-player-types';
import { slideTransition, slideVariants } from '../utils/quiz-player-animations';
import { CodeOptionDisplay } from './code-option-display';
import { OptionCard, SegmentedProgress } from './quiz-option-card';
import { ResultsScreen } from './quiz-results-screen';

import type { QuizPlayerProps } from '../quiz-player-types';

// Quiz Player
export const QuizPlayer = memo(function QuizPlayer({
  attemptsRemaining,
  passingScore,
  quiz,
  showCorrectAnswers,
  timeLimit,
  submitAction,
  ensureSession,
  resultsBackHref
}: QuizPlayerProps): JSX.Element {
  const router = useRouter();
  const pathname = usePathname();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const answersRef = useRef(answers);
  answersRef.current = answers;

  const totalSeconds = timeLimit;
  const [secondsLeft, setSecondsLeft] = useState<number | null>(totalSeconds);
  const [isPreparing, setIsPreparing] = useState(false);
  const hasAutoSubmitted = useRef(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [state, dispatch, isPending] = useActionState<ActionState<SubmitQuizResult>, any>(
    submitAction ?? submitQuizAnswers,
    {
      success: false
    }
  );

  const questions = quiz.questions;
  const highlightedPrompts = useHighlightedPrompts(questions);
  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const isCodeQuestion = currentQuestion?.codeLanguage !== null && currentQuestion?.codeLanguage !== undefined;

  /** Navigate to a question with direction tracking for animations. */
  const navigateTo = useCallback(
    (index: number) => {
      setDirection(index > currentIndex ? 1 : -1);
      setCurrentIndex(index);
    },
    [currentIndex]
  );

  const handleSubmit = useCallback(() => {
    const formattedAnswers = Object.entries(answersRef.current).map(([questionId, answer]) => ({
      answer,
      questionId
    }));
    const dispatchSubmit = () =>
      startTransition(() => {
        dispatch({ answers: formattedAnswers, quizId: quiz.id });
      });

    // For the public demo, ensure a (guest) session exists before submitting.
    if (ensureSession) {
      setIsPreparing(true);
      void ensureSession()
        .then(ok => {
          if (ok) dispatchSubmit();
        })
        .finally(() => setIsPreparing(false));
      return;
    }
    dispatchSubmit();
  }, [dispatch, ensureSession, quiz.id]);

  const handleRetake = () => {
    window.location.reload();
  };

  // Countdown
  useEffect(() => {
    if (secondsLeft === null || state.success) return;
    if (secondsLeft <= 0) {
      if (!hasAutoSubmitted.current) {
        hasAutoSubmitted.current = true;
        showWarningToast('Time is up! Submitting your quiz…');
        handleSubmit();
      }
      return;
    }
    const id = setInterval(() => setSecondsLeft(s => (s !== null ? s - 1 : null)), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, state.success]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      // Don't capture when typing in an input
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
      if (state.success) return;

      if (event.key === 'ArrowLeft' && currentIndex > 0) {
        event.preventDefault();
        navigateTo(currentIndex - 1);
      } else if (event.key === 'ArrowRight' && currentIndex < questions.length - 1) {
        event.preventDefault();
        navigateTo(currentIndex + 1);
      } else if (currentQuestion?.type === QuestionType.SINGLE_CHOICE && /^[a-z]$/i.test(event.key)) {
        const letterIndex = event.key.toUpperCase().charCodeAt(0) - 65;
        if (letterIndex >= 0 && letterIndex < currentQuestion.options.length) {
          event.preventDefault();
          const option = currentQuestion.options[letterIndex];
          if (option) {
            handleSingleChoice(currentQuestion.id, option.id);
          }
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentIndex, currentQuestion, questions.length, state.success, navigateTo]);

  useEffect(() => {
    if (!state.success && state.error) showErrorToast(state.error);
  }, [state]);

  if (state.success) {
    return (
      <ResultsScreen
        passed={state.data?.passed}
        passingScore={passingScore}
        results={state.data?.results ?? []}
        score={state.data?.score ?? 0}
        showCorrectAnswers={showCorrectAnswers}
        total={state.data?.total ?? questions.length}
        onBack={() => router.push((resultsBackHref ?? `/organization/${extractOrgSlug(pathname)}/quizzes`) as Route)}
        onRetake={handleRetake}
      />
    );
  }

  if (!currentQuestion) return <></>;

  const isTimeLow = secondsLeft !== null && secondsLeft <= 60;
  const isTimeWarning = secondsLeft !== null && secondsLeft <= 120 && secondsLeft > 60;

  const handleSingleChoice = (questionId: string, optionId: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const handleMultipleChoice = (questionId: string, optionId: string, checked: boolean) => {
    setAnswers(prev => {
      const current = (prev[questionId] as string[]) || [];
      return {
        ...prev,
        [questionId]: checked ? [...current, optionId] : current.filter(id => id !== optionId)
      };
    });
  };

  const handleCustomInput = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  return (
    <div className='space-y-5'>
      {/* Header */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
        <div className='min-w-0 flex-1'>
          <h1 className='truncate text-xl font-bold'>{quiz.title}</h1>
          {quiz.description && (
            <HtmlContent
              className='mt-0.5 line-clamp-2 text-sm text-muted-foreground'
              html={stripLeadingTitle(quiz.description, quiz.title)}
            />
          )}
        </div>

        <div className='flex shrink-0 items-center gap-2'>
          {secondsLeft !== null && (
            <div
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-sm font-semibold tabular-nums transition-colors ${
                isTimeLow
                  ? 'animate-pulse border-red-300 bg-red-50 text-red-600 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400'
                  : isTimeWarning
                    ? 'border-yellow-300 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-400'
                    : 'border-border bg-muted text-foreground'
              }`}
            >
              <ClockIcon className='h-4 w-4' />
              {formatTime(secondsLeft)}
            </div>
          )}
          {attemptsRemaining !== null && (
            <span className='rounded-lg border border-border bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground'>
              {attemptsRemaining} attempt{attemptsRemaining !== 1 ? 's' : ''} left
            </span>
          )}
        </div>
      </div>

      {/* Segmented progress */}
      <div className='space-y-1.5'>
        <SegmentedProgress
          answers={answers}
          currentIndex={currentIndex}
          questions={questions}
          onNavigate={navigateTo}
        />
        <div className='flex items-center justify-between text-xs text-muted-foreground'>
          <span>
            {answeredCount} of {questions.length} answered
          </span>
          <span>
            {currentIndex + 1} / {questions.length}
          </span>
        </div>
      </div>

      {/* Bento grid */}
      <div className='grid gap-4 2xl-screen:grid-cols-[240px_1fr]'>
        {/* Question navigator sidebar — desktop only */}
        <div className='hidden 2xl-screen:block'>
          <Card className='sticky top-6'>
            <CardHeader>
              <CardTitle className='text-xs font-semibold tracking-wider text-muted-foreground uppercase'>
                Questions
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 pt-0'>
              <div className='grid grid-cols-4 gap-1.5'>
                {questions.map((q, i) => {
                  const isAnswered = q.id in answers;
                  const isCurrent = i === currentIndex;
                  return (
                    <button
                      key={q.id}
                      className={`flex h-8 w-full items-center justify-center rounded-lg text-xs font-semibold transition-all ${
                        isCurrent
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : isAnswered
                            ? 'bg-primary/15 text-primary'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                      type='button'
                      onClick={() => navigateTo(i)}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className='space-y-1.5 border-t pt-3'>
                <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                  <span className='h-2.5 w-2.5 rounded-full bg-primary' />
                  Current
                </div>
                <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                  <span className='h-2.5 w-2.5 rounded-full bg-primary/40' />
                  Answered
                </div>
                <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                  <span className='h-2.5 w-2.5 rounded-full bg-muted-foreground/30' />
                  Unanswered
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Question + Options area */}
        <div className='space-y-4'>
          {/* Prompt card - full width */}
          <Card>
            <CardHeader>
              <div className='flex items-center gap-2'>
                <span className='flex h-7 items-center rounded-lg bg-primary/10 px-2.5 text-xs font-bold text-primary'>
                  Q{currentIndex + 1}
                </span>
                {currentQuestion.title && (
                  <p className='text-xs font-semibold tracking-wide text-muted-foreground'>{currentQuestion.title}</p>
                )}
              </div>
              <AnimatePresence custom={direction} mode='wait'>
                <motion.div
                  key={`${currentQuestion.id}-prompt`}
                  animate='center'
                  custom={direction}
                  exit='exit'
                  initial='enter'
                  transition={slideTransition}
                  variants={slideVariants}
                >
                  <HtmlContent
                    className='text-base leading-relaxed font-medium'
                    html={highlightedPrompts.get(currentQuestion.id) ?? currentQuestion.prompt}
                  />
                  {currentQuestion.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      className='mt-3 max-h-72 w-full rounded-lg border object-contain'
                      alt='Question illustration'
                      src={currentQuestion.imageUrl}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
              {currentQuestion.type === QuestionType.MULTIPLE_CHOICE && (
                <p className='text-xs text-muted-foreground'>Select all that apply</p>
              )}
            </CardHeader>
          </Card>

          {/* Options card */}
          <Card>
            <CardContent className='space-y-2.5 pt-5'>
              <AnimatePresence custom={direction} mode='wait'>
                <motion.div
                  key={`${currentQuestion.id}-options`}
                  className='space-y-2.5'
                  animate='center'
                  custom={direction}
                  exit='exit'
                  initial='enter'
                  transition={slideTransition}
                  variants={slideVariants}
                >
                  {/* Single choice */}
                  {currentQuestion.type === QuestionType.SINGLE_CHOICE &&
                    currentQuestion.options.map((opt, optIdx) => (
                      <OptionCard
                        key={opt.id}
                        isSelected={(answers[currentQuestion.id] as string) === opt.id}
                        letter={OPTION_LETTERS[optIdx] ?? String(optIdx + 1)}
                        onClick={() => handleSingleChoice(currentQuestion.id, opt.id)}
                      >
                        {isCodeQuestion ? (
                          <CodeOptionDisplay
                            code={opt.content}
                            language={currentQuestion.codeLanguage ?? 'plaintext'}
                          />
                        ) : (
                          opt.content
                        )}
                      </OptionCard>
                    ))}

                  {/* Multiple choice */}
                  {currentQuestion.type === QuestionType.MULTIPLE_CHOICE &&
                    currentQuestion.options.map((opt, optIdx) => {
                      const selected = ((answers[currentQuestion.id] as string[]) || []).includes(opt.id);
                      return (
                        <label
                          key={opt.id}
                          className={`group flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3.5 text-sm transition-all ${
                            selected
                              ? 'border-primary bg-primary/5 shadow-sm dark:bg-primary/10'
                              : 'border-border hover:border-primary/40 hover:bg-muted/40'
                          }`}
                        >
                          {/* Letter badge */}
                          <span
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                              selected
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                            }`}
                          >
                            {OPTION_LETTERS[optIdx] ?? String(optIdx + 1)}
                          </span>
                          <Checkbox
                            checked={selected}
                            onCheckedChange={(checked: boolean) =>
                              handleMultipleChoice(currentQuestion.id, opt.id, checked)
                            }
                          />
                          <span className={`flex-1 ${selected ? 'font-medium text-primary' : ''}`}>
                            {isCodeQuestion ? (
                              <CodeOptionDisplay
                                code={opt.content}
                                language={currentQuestion.codeLanguage ?? 'plaintext'}
                              />
                            ) : (
                              opt.content
                            )}
                          </span>
                        </label>
                      );
                    })}

                  {/* Custom input */}
                  {currentQuestion.type === QuestionType.CUSTOM_INPUT && (
                    <div className='space-y-1.5 pt-1'>
                      <Label htmlFor='custom-input'>Your answer</Label>
                      <Input
                        className={isCodeQuestion ? 'font-mono' : ''}
                        id='custom-input'
                        placeholder='Type your answer here…'
                        value={(answers[currentQuestion.id] as string) || ''}
                        onChange={e => handleCustomInput(currentQuestion.id, e.target.value)}
                      />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </CardContent>

            {/* Navigation footer */}
            <CardFooter className='flex items-center justify-between gap-3 border-t pt-4'>
              <Button disabled={currentIndex === 0} variant='outline' onClick={() => navigateTo(currentIndex - 1)}>
                <ChevronLeftIcon className='mr-1.5 h-4 w-4' />
                Previous
              </Button>

              {/* Mobile dot nav */}
              <div className='flex items-center gap-1 2xl-screen:hidden'>
                {questions.map((q, i) => (
                  <button
                    key={q.id}
                    className={`h-2 rounded-full transition-all ${
                      i === currentIndex
                        ? 'w-4 bg-primary'
                        : q.id in answers
                          ? 'w-2 bg-primary/40'
                          : 'w-2 bg-muted-foreground/30'
                    }`}
                    type='button'
                    onClick={() => navigateTo(i)}
                  />
                ))}
              </div>

              {currentIndex < questions.length - 1 ? (
                <Button variant='primary' onClick={() => navigateTo(currentIndex + 1)}>
                  Next
                  <ChevronRightIcon className='ml-1.5 h-4 w-4' />
                </Button>
              ) : (
                <Button
                  disabled={isPending || isPreparing}
                  isLoading={isPending || isPreparing}
                  variant='primary'
                  onClick={handleSubmit}
                >
                  <SendIcon className='mr-1.5 h-4 w-4' />
                  {isPending || isPreparing ? 'Submitting…' : 'Submit Quiz'}
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
});
