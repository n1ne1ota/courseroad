'use client';

import type { JSX, ReactNode } from 'react';
import { startTransition, useActionState, useEffect } from 'react';

import type { Route } from 'next';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { showErrorToast, showSuccessToast } from '@courseroad/iota-ui';
import { Button } from '@courseroad/kurume-ui';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@courseroad/kurume-ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@courseroad/kurume-ui';
import { HtmlContent } from '@courseroad/kurume-ui/editor';
import {
  CheckCircle2Icon,
  ClipboardCheckIcon,
  ClockIcon,
  EyeIcon,
  GlobeIcon,
  HashIcon,
  LockIcon,
  MonitorIcon,
  RefreshCwIcon,
  RocketIcon,
  ShieldIcon,
  TargetIcon,
  XCircleIcon
} from 'lucide-react';

import { extractOrgSlug } from '@/lib/routes/org';
import { cn } from '@/lib/utils/cn';

import { updateQuiz } from '@/features/quiz/actions/quiz-actions';
import { QuizVisibility } from '@/features/quiz/question-types';

import type { Quiz, QuizOption, QuizQuestion } from '@/features/quiz/editor-types';

type QuizWithQuestions = Quiz & {
  questions: (QuizQuestion & {
    options: QuizOption[];
  })[];
};

interface QuizPublishPageProps {
  quiz: QuizWithQuestions;
}

const VISIBILITY_META: Record<
  QuizVisibility,
  { badge: string; badgeClass: string; description: string; icon: ReactNode }
> = {
  [QuizVisibility.DRAFT]: {
    badge: 'Draft',
    badgeClass: 'bg-orange-muted text-orange-muted-foreground',
    description: 'Not yet visible to learners',
    icon: <LockIcon className='h-4 w-4 text-orange' />
  },
  [QuizVisibility.PRIVATE]: {
    badge: 'Private',
    badgeClass: 'bg-indigo-muted text-indigo-muted-foreground',
    description: 'Accessible via invite only',
    icon: <ShieldIcon className='h-4 w-4 text-indigo' />
  },
  [QuizVisibility.PUBLIC]: {
    badge: 'Public',
    badgeClass: 'bg-success-muted text-success-muted-foreground',
    description: 'Live and visible to all enrolled learners',
    icon: <GlobeIcon className='h-4 w-4 text-success' />
  }
};

/**
 * Quiz publish page component within quiz editor component
 * @param params: quiz
 * @returns: QuizPublishPage component
 */
export function QuizPublishPage({ quiz }: QuizPublishPageProps): JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const orgSlug = extractOrgSlug(pathname);
  const visibility = quiz.visibility ?? QuizVisibility.DRAFT;
  const meta = VISIBILITY_META[visibility];

  const [state, dispatch, isPending] = useActionState(updateQuiz, {
    success: false
  } as Awaited<ReturnType<typeof updateQuiz>>);

  useEffect(() => {
    if (state.success) {
      showSuccessToast('Quiz updated successfully');
      router.refresh();
    } else if (state.error) {
      showErrorToast(state.error);
    }
  }, [state, router]);

  const dispatchVisibility = (next: QuizVisibility) => {
    startTransition(() => {
      dispatch({ id: quiz.id, visibility: next });
    });
  };

  const handlePublishToggle = () => {
    dispatchVisibility(visibility === QuizVisibility.DRAFT ? QuizVisibility.PUBLIC : QuizVisibility.DRAFT);
  };

  const hasTitle = Boolean(quiz.title?.trim().length > 0);
  const hasQuestions = quiz.questions.length > 0;
  const allQuestionsValid = quiz.questions.every(q => {
    const hasPrompt = Boolean(q.prompt?.trim().length > 0);
    const hasOptions = q.options.length > 0;
    const hasCorrectAnswer = q.options.some(opt => opt.isCorrect);
    return hasPrompt && hasOptions && hasCorrectAnswer;
  });

  const canPublish = hasTitle && hasQuestions && allQuestionsValid;
  const isLive = visibility !== QuizVisibility.DRAFT;

  return (
    // Main Container: 1 col on base -> 3 cols on 2xl-screen -> 4 cols on xl-screen
    // Increased gap to 6 (24px) for better visual separation across breakpoints
    <div className='grid grid-cols-1 gap-6 xl-screen:grid-cols-4 2xl-screen:grid-cols-3 2xl-screen:items-start'>
      {/* Left column: Preview & Stats. Takes 2 cols on 2xl-screen, 3 on xl-screen */}
      <div className='order-2 flex flex-col gap-6 xl-screen:col-span-3 2xl-screen:order-1 2xl-screen:col-span-2'>
        <Card className='flex flex-col'>
          <CardHeader>
            <CardTitle icon={<MonitorIcon />} iconColor='primary' iconVariant='glow'>
              Quiz Preview
            </CardTitle>
            <CardDescription>Review your quiz details before publishing</CardDescription>
            <CardAction>
              <span
                className={cn(
                  'inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
                  meta.badgeClass
                )}
              >
                {meta.icon}
                {meta.badge}
              </span>
            </CardAction>
          </CardHeader>
          <CardContent className='flex flex-col gap-5 pt-6'>
            {/* Title row: Stacks on ultra-small screens, side-by-side on xs-screen+ */}
            <div className='flex flex-col gap-4 xs-screen:flex-row xs-screen:items-center xs-screen:justify-between'>
              <h3 className='text-2xl font-semibold tracking-tight'>
                {quiz.title || <span className='text-muted-foreground italic'>Untitled Quiz</span>}
              </h3>
              <Button className='w-full xs-screen:w-auto' asChild size='sm' variant='outline'>
                <Link
                  href={`/organization/${orgSlug}/quizzes/${quiz.id}` as Route}
                  rel='noopener noreferrer'
                  target='_blank'
                >
                  <EyeIcon className='mr-2 h-4 w-4' />
                  Preview
                </Link>
              </Button>
            </div>

            <div className='rounded-xl border bg-muted/20 px-4 py-3'>
              {quiz.description ? (
                <HtmlContent className='text-sm leading-relaxed text-muted-foreground' html={quiz.description} />
              ) : (
                <p className='text-sm text-muted-foreground italic'>No description added.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right column: Actions & Checklist. Takes 1 col on 2xl-screen+ */}
      <div className='order-1 flex flex-col gap-6 2xl-screen:order-2 2xl-screen:col-span-1'>
        <Card
          className={cn(
            'border-2 transition-colors',
            visibility === QuizVisibility.PUBLIC && 'border-success/40',
            visibility === QuizVisibility.PRIVATE && 'border-indigo/40',
            visibility === QuizVisibility.DRAFT && 'border-orange/40'
          )}
        >
          <CardHeader>
            <div className='flex items-center gap-2'>
              {meta.icon}
              <CardTitle className='text-base'>{meta.badge}</CardTitle>
            </div>
            <CardDescription className='text-xs'>{meta.description}</CardDescription>
          </CardHeader>
          <CardContent className='space-y-3 pt-6'>
            {/* Publish Actions: Full width stack on base, side-by-side on xs-screen, stack again or flex on 2xl-screen depending on space */}
            <div className='flex flex-col gap-3 xs-screen:flex-row xs-screen:items-center 2xl-screen:flex-col 4xl-screen:flex-row'>
              <Select
                disabled={isPending}
                value={visibility}
                onValueChange={val => dispatchVisibility(val as QuizVisibility)}
              >
                <SelectTrigger className='w-full'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={QuizVisibility.DRAFT}>Draft</SelectItem>
                  <SelectItem disabled={!canPublish} value={QuizVisibility.PUBLIC}>
                    Public
                  </SelectItem>
                  <SelectItem disabled={!canPublish} value={QuizVisibility.PRIVATE}>
                    Private
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button
                className='w-full shrink-0 xs-screen:w-auto 2xl-screen:w-full 4xl-screen:w-auto'
                disabled={isPending || (!canPublish && !isLive)}
                isLoading={isPending}
                size='sm'
                variant={isLive ? 'outline' : 'default'}
                onClick={handlePublishToggle}
              >
                {isPending ? null : isLive ? (
                  <LockIcon className='mr-1.5 h-3.5 w-3.5' />
                ) : (
                  <RocketIcon className='mr-1.5 h-3.5 w-3.5' />
                )}
                {isPending ? 'Updating…' : isLive ? 'Unpublish' : 'Publish'}
              </Button>
            </div>
            {!canPublish && !isLive && (
              <p className='text-xs text-muted-foreground'>Complete the checklist to publish</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-base' icon={<ClipboardCheckIcon />} iconColor='primary' iconVariant='glow'>
              Checklist
            </CardTitle>
            <CardDescription className='text-xs'>Requirements before publishing</CardDescription>
          </CardHeader>
          <CardContent className='space-y-3 pt-6'>
            <ChecklistItem checked={hasTitle} label='Has a title' />
            <ChecklistItem checked={hasQuestions} label='Has questions' />
            <ChecklistItem checked={allQuestionsValid} label='All questions valid' />
          </CardContent>
        </Card>

        {/* Stat tiles */}
        <div className='grid grid-cols-2 gap-4'>
          <StatTile
            value={
              quiz.questions.length === 0
                ? 'None'
                : `${quiz.questions.length} ${quiz.questions.length === 1 ? 'Question' : 'Questions'}`
            }
            icon={<HashIcon />}
            label='Questions'
          />
          <StatTile
            icon={<ClockIcon />}
            label='Time Limit'
            value={quiz.timeLimit ? `${Math.round(quiz.timeLimit / 60)} min` : 'Unlimited'}
          />
          <StatTile
            icon={<RefreshCwIcon />}
            label='Attempts'
            value={quiz.allowedAttempts ? String(quiz.allowedAttempts) : 'Unlimited'}
          />
          <StatTile
            icon={<TargetIcon />}
            label='Passing Score'
            value={quiz.passingScore ? `${quiz.passingScore}%` : 'Not set'}
          />
        </div>
      </div>
    </div>
  );
}

function StatTile({ icon, label, value }: { icon: ReactNode; label: string; value: string }): JSX.Element {
  return (
    <div className='flex flex-col gap-2 rounded-xl border bg-muted/20 p-4'>
      <div className='flex items-center gap-1.5 text-muted-foreground [&>svg]:h-3.5 [&>svg]:w-3.5'>
        {icon}
        <span className='text-xs font-medium tracking-wide'>{label}</span>
      </div>
      <div className='text-sm font-semibold'>{value}</div>
    </div>
  );
}

function ChecklistItem({ checked, label }: { checked: boolean; label: string }): JSX.Element {
  return (
    <div className='flex items-center gap-2.5'>
      {checked ? (
        <CheckCircle2Icon className='h-4 w-4 shrink-0 text-green-500' />
      ) : (
        <XCircleIcon className='h-4 w-4 shrink-0 text-muted-foreground' />
      )}
      <span className={cn('text-sm', !checked && 'text-muted-foreground')}>{label}</span>
    </div>
  );
}
