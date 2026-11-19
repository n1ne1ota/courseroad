'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import {
  Badge,
  Button,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ConfirmationDialog,
  Progress,
  ScrollArea,
  Skeleton,
  Switch
} from '@courseroad/kurume-ui';

import { BadgeDollarSign, FileText, Globe, LayoutList, Rocket } from 'lucide-react';

import {
  changeOrganizationPublishing,
  changeOrganizationVisibility,
  changePlatformPublishing,
  changePlatformVisibility,
  readOrganizationPublishing,
  readPlatformPublishing
} from '@/features/course/actions/publishing-actions';
import { PublishingCategoryCard, PublishingCurriculumCard } from '@/features/course/components/publishing-cards';
import { summarizePublishing } from '@/features/course/lib/publishing-view';

import type { PublishingReadiness, PublishingTarget } from '@/features/course/lib/publishing';
import type { PublishingGroup } from '@/features/course/lib/publishing';
import type { Course } from '@/features/course/types/course-types';

type Props = {
  courseId: string;
  scope: 'organization' | 'platform';
  /** Unsaved edits in Details or Curriculum. Readiness only reflects saved content. */
  dirty: boolean;
  saving: boolean;
  onNavigate: (target: PublishingTarget) => Promise<void>;
  onStatusChange: (status: Course['status']) => void;
  onBusyChange: (busy: boolean) => void;
};

type Dialog = 'publish' | 'unpublish';

const STATUS_COLOR = { Draft: 'neutral', Published: 'success', Archived: 'warning' } as const;

const DIALOGS: Record<Dialog, { title: string; confirm: string; destructive: boolean }> = {
  publish: { title: 'Publish course?', confirm: 'Publish course', destructive: false },
  unpublish: { title: 'Unpublish course?', confirm: 'Unpublish', destructive: true }
};

const GROUP_ICONS: Record<PublishingGroup, React.ReactNode> = {
  details: <FileText aria-hidden='true' />,
  pricing: <BadgeDollarSign aria-hidden='true' />,
  curriculum: <LayoutList aria-hidden='true' />
};

/** Persisted readiness and explicit publish transitions, shared by both editor scopes. */
export function CoursePublishing({ courseId, scope, dirty, saving, onNavigate, onStatusChange, onBusyChange }: Props) {
  const router = useRouter();
  const [readiness, setReadiness] = useState<PublishingReadiness | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    const read = scope === 'platform' ? readPlatformPublishing : readOrganizationPublishing;
    void read({ courseId })
      .then(result => {
        if (!active) return;
        if (!result.success || !result.data) throw new Error(result.error || 'Unable to load publishing readiness.');
        setReadiness(result.data);
        onStatusChange(result.data.status);
      })
      .catch(cause => {
        if (active) setError(cause instanceof Error ? cause.message : 'Unable to load publishing readiness.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [courseId, scope, onStatusChange]);

  /** Runs one server change, adopts the fresh readiness it returns and reports the outcome. */
  const apply = async (
    change: () => Promise<{ success: boolean; data?: PublishingReadiness | undefined; error?: string | undefined }>,
    done: (next: PublishingReadiness) => string | null
  ) => {
    setBusy(true);
    onBusyChange(true);
    setError(null);
    setMessage('');
    try {
      const result = await change();
      if (!result.success || !result.data) throw new Error(result.error || 'Unable to change the course.');
      setReadiness(result.data);
      onStatusChange(result.data.status);
      const failure = done(result.data);
      if (failure) setError(failure);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to change the course.');
    } finally {
      setBusy(false);
      onBusyChange(false);
      setDialog(null);
    }
  };

  const toggleCatalog = (listed: boolean) =>
    apply(
      () =>
        (scope === 'platform' ? changePlatformVisibility : changeOrganizationVisibility)({
          courseId,
          visibility: listed ? 'Public' : 'Unlisted'
        }),
      next => {
        setMessage(next.visibility === 'Public' ? 'Course is listed in the catalog.' : 'Course is no longer listed.');
        return null;
      }
    );

  const confirm = async () => {
    if (!dialog || !readiness || busy || saving || (dialog === 'publish' && dirty)) return;
    const operation = dialog;
    await apply(
      () =>
        (scope === 'platform' ? changePlatformPublishing : changeOrganizationPublishing)({
          courseId,
          operation,
          expectedStatus: operation === 'publish' ? 'Draft' : 'Published'
        }),
      next => {
        if (next.status !== (operation === 'publish' ? 'Published' : 'Draft'))
          return 'The course changed. Resolve the checklist items before publishing.';
        setMessage(
          operation === 'publish' ? 'Course published.' : 'Course returned to Draft. Existing learners retain access.'
        );
        return null;
      }
    );
  };

  if (!readiness)
    return error ? (
      <p className='rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm' role='alert'>
        {error}
      </p>
    ) : (
      <div className='grid max-w-5xl grid-cols-1 gap-4 lg:grid-cols-6'>
        <Skeleton className='h-48 rounded-xl lg:col-span-4' />
        <Skeleton className='h-48 rounded-xl lg:col-span-2' />
        <Skeleton className='h-64 rounded-xl lg:col-span-4 lg:row-span-2' />
        <Skeleton className='h-64 rounded-xl lg:col-span-2' />
      </div>
    );

  const summary = summarizePublishing(readiness);
  const { status, visibility } = readiness;
  const live = status === 'Published';
  const draft = status === 'Draft';
  const complete = summary.remaining === 0;
  const listed = visibility === 'Public';
  const locked = busy || saving || loading;
  const publishBlocked = !readiness.canPublish || dirty || locked;
  const learners = readiness.enrollmentCount ?? 0;
  const note = dirty
    ? 'Save your changes before publishing. Readiness reflects saved content.'
    : !complete && draft
      ? `Resolve ${summary.remaining} ${summary.remaining === 1 ? 'requirement' : 'requirements'} to publish.`
      : null;
  const group = (id: PublishingGroup) => summary.groups.find(entry => entry.id === id);
  const details = group('details');
  const pricing = group('pricing');
  const curriculum = group('curriculum');

  return (
    <div className='grid max-w-5xl grid-cols-1 gap-4 lg:grid-cols-6' aria-busy={busy}>
      <Card className='lg:col-span-4'>
        <CardHeader>
          <CardTitle icon={<Rocket aria-hidden='true' />} iconColor={live ? 'success' : 'brand'} iconVariant='soft'>
            {live ? 'Your course is live' : 'Publish course'}
          </CardTitle>
          <CardDescription>
            {live
              ? `${learners} ${learners === 1 ? 'learner' : 'learners'} enrolled.`
              : draft
                ? 'Finish the requirements, then publish.'
                : 'Archived courses are read-only.'}
          </CardDescription>
          <CardAction>
            <Badge color={STATUS_COLOR[status]}>{status}</Badge>
          </CardAction>
        </CardHeader>
        <CardContent className='flex flex-1 flex-col justify-between gap-6'>
          {draft && (
            <div className='space-y-2'>
              <p className='text-sm tabular-nums'>
                <span className='font-medium'>
                  {summary.passed} of {summary.total}
                </span>{' '}
                <span className='text-muted-foreground'>requirements ready</span>
              </p>
              <Progress max={summary.total} value={summary.passed} aria-label='Requirements complete' />
            </div>
          )}
          {draft && complete && summary.suggestions.length > 0 && (
            <div className='space-y-2'>
              <p className='text-xs font-medium tracking-wide text-muted-foreground uppercase'>Recommended</p>
              <ScrollArea className='max-h-40' fade viewportProps={{ 'aria-label': 'Recommendations' }}>
                <ul className='divide-y'>
                  {summary.suggestions.map(suggestion => (
                    <li key={suggestion.id} className='flex items-center gap-3 py-2'>
                      <p className='min-w-0 flex-1 text-xs break-words text-muted-foreground'>{suggestion.label}</p>
                      <Button
                        type='button'
                        size='xs'
                        variant='ghost'
                        aria-label={`${suggestion.action}: ${suggestion.label}`}
                        onClick={() => void onNavigate(suggestion.target)}
                      >
                        {suggestion.action}
                      </Button>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </div>
          )}
          <div className='space-y-3'>
            {draft && (
              <Button
                className='w-full'
                type='button'
                disabled={publishBlocked}
                isLoading={busy}
                onClick={() => setDialog('publish')}
              >
                Publish course
              </Button>
            )}
            {live && (
              <Button
                className='w-full'
                type='button'
                color='destructive'
                disabled={locked}
                isLoading={busy}
                variant='outline'
                onClick={() => setDialog('unpublish')}
              >
                Unpublish
              </Button>
            )}
            {note && <p className='text-center text-sm text-muted-foreground'>{note}</p>}
            {error && (
              <p className='text-center text-sm text-destructive' role='alert'>
                {error}
              </p>
            )}
            <output className='sr-only' aria-live='polite'>
              {message}
            </output>
          </div>
        </CardContent>
      </Card>

      <Card className='lg:col-span-2'>
        <CardHeader>
          <CardTitle icon={<Globe aria-hidden='true' />} iconColor='brand' iconVariant='soft'>
            Visibility
          </CardTitle>
          <CardDescription>Who can find this course.</CardDescription>
        </CardHeader>
        <CardContent className='flex flex-1 items-center'>
          <div className='flex w-full items-center justify-between gap-4'>
            <div>
              <label className='text-sm font-medium' htmlFor='course-catalog-listing'>
                List in catalog
              </label>
              <p className='text-xs text-muted-foreground'>
                {visibility === 'Private'
                  ? 'This course is private. Turn on to list it in the catalog.'
                  : listed
                    ? 'Anyone can find this course in the catalog.'
                    : 'Only people with the link can open it.'}
              </p>
            </div>
            <Switch
              id='course-catalog-listing'
              checked={listed}
              disabled={locked || status === 'Archived'}
              onCheckedChange={checked => void toggleCatalog(checked)}
            />
          </div>
        </CardContent>
      </Card>

      {draft && curriculum && (
        <PublishingCurriculumCard
          className='lg:col-span-4 lg:row-span-2'
          group={curriculum}
          icon={GROUP_ICONS.curriculum}
          onNavigate={onNavigate}
        />
      )}
      {draft && details && (
        <PublishingCategoryCard
          className='lg:col-span-2'
          group={details}
          icon={GROUP_ICONS.details}
          onNavigate={onNavigate}
        />
      )}
      {draft && pricing && (
        <PublishingCategoryCard
          className='lg:col-span-2'
          group={pricing}
          icon={GROUP_ICONS.pricing}
          onNavigate={onNavigate}
        />
      )}

      <ConfirmationDialog
        description={
          dialog === 'unpublish'
            ? 'Hide this course and stop new enrollments. Existing learners retain access and progress.'
            : listed
              ? 'Your saved course will be listed in the catalog and open for free enrollment.'
              : 'Your saved course will be open for free enrollment to anyone with the link. It will not be listed.'
        }
        confirmText={dialog ? DIALOGS[dialog].confirm : ''}
        open={dialog !== null}
        title={dialog ? DIALOGS[dialog].title : ''}
        variant={dialog && DIALOGS[dialog].destructive ? 'destructive' : 'default'}
        onConfirm={confirm}
        onOpenChange={next => {
          if (!busy && !next) setDialog(null);
        }}
      />
    </div>
  );
}
