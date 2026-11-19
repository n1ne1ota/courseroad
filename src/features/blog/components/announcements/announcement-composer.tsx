'use client';

import { useState, useTransition } from 'react';

import {
  Button,
  DialogAlert,
  DialogAlertBackdrop,
  DialogAlertClose,
  DialogAlertDescription,
  DialogAlertPopup,
  DialogAlertPortal,
  DialogAlertTitle,
  Input,
  Switch
} from '@courseroad/iota-ui';
import { RichTextEditor } from '@courseroad/iota-ui/editor';

import { createAnnouncement, publishAnnouncement, updateAnnouncement } from '../../actions/announcement-actions';
import { describePublishOutcome } from '../../lib/announcement-messages';
import { ANNOUNCEMENT_TITLE_MAX, type AuthoringTarget } from '../../schemas/announcement-schemas';

export interface ComposerInitial {
  bodyHtml: string;
  id: string;
  pinned: boolean;
  status: 'Draft' | 'Published';
  title: string;
}

interface ComposerProps {
  /** What emailing would reach. The email option is hidden while `cap` is 0. */
  audience: { cap: number; count: number };
  initial: ComposerInitial | null;
  onCancel: () => void;
  /** Called after a successful save or publish, with the message to show. */
  onDone: (message: string) => void;
  target: AuthoringTarget;
}

/** Writes or edits one announcement: title, body in the Iota editor, pin, and an optional email on publish. */
export function AnnouncementComposer({ audience, initial, onCancel, onDone, target }: ComposerProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [bodyHtml, setBodyHtml] = useState(initial?.bodyHtml ?? '');
  const [pinned, setPinned] = useState(initial?.pinned ?? false);
  const [sendEmail, setSendEmail] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const isPublished = initial?.status === 'Published';
  const emailAvailable = audience.cap > 0 && !isPublished;
  const overCap = audience.count > audience.cap;
  const willEmail = emailAvailable && sendEmail && !overCap && audience.count > 0;
  const learners = audience.count === 1 ? '1 learner' : `${audience.count} learners`;

  /** Saves the draft (creating it the first time) and returns its id, or `null` after showing why not. */
  async function save(): Promise<string | null> {
    if (initial) {
      const result = await updateAnnouncement({ announcementId: initial.id, bodyHtml, pinned, title });
      if (!result.success) {
        setError(result.error ?? 'Could not save');
        return null;
      }
      return initial.id;
    }
    const result = await createAnnouncement({ ...target, bodyHtml, pinned, title });
    if (!result.success || !result.data) {
      setError(result.fieldErrors?.title?.[0] ?? result.fieldErrors?.bodyHtml?.[0] ?? result.error ?? 'Could not save');
      return null;
    }
    return result.data.id;
  }

  function saveOnly() {
    setError(null);
    startTransition(async () => {
      const id = await save();
      if (id) onDone(isPublished ? 'Changes saved.' : 'Draft saved.');
    });
  }

  function publish() {
    setConfirming(false);
    setError(null);
    startTransition(async () => {
      const id = await save();
      if (!id) return;
      const result = await publishAnnouncement({ announcementId: id, sendEmail: willEmail });
      if (!result.success || !result.data) {
        setError(result.error ?? 'Could not publish. Your draft is saved.');
        return;
      }
      onDone(result.data.alreadyPublished ? 'Published.' : describePublishOutcome(result.data.email));
    });
  }

  const invalid = title.trim().length === 0 || bodyHtml.trim().length === 0;

  return (
    <section className='flex flex-col gap-4' aria-label={initial ? 'Edit announcement' : 'New announcement'}>
      <Input
        label='Title'
        maxLength={ANNOUNCEMENT_TITLE_MAX}
        value={title}
        onChange={event => setTitle(event.target.value)}
      />
      <RichTextEditor
        placeholder='Write your announcement'
        value={bodyHtml}
        aria-label='Announcement message'
        onChange={setBodyHtml}
      />

      <label className='flex items-center gap-3 text-sm'>
        <Switch checked={pinned} aria-label='Pin to the top of the feed' onCheckedChange={setPinned} />
        <span>Pin to the top of the feed</span>
      </label>

      {emailAvailable ? (
        <div className='flex flex-col gap-1'>
          <label className='flex items-center gap-3 text-sm'>
            <Switch
              checked={sendEmail && !overCap}
              disabled={overCap || audience.count === 0}
              aria-label={`Also email ${learners}`}
              onCheckedChange={setSendEmail}
            />
            <span>Also email {learners}</span>
          </label>
          {overCap ? (
            <p className='text-sm text-muted-foreground'>
              That is more than the limit of {audience.cap} for one announcement, so it will be published in the app
              only.
            </p>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <p className='text-danger text-sm' role='alert'>
          {error}
        </p>
      ) : null}

      <div className='flex flex-wrap items-center gap-3'>
        <Button type='button' disabled={pending || invalid} variant='secondary' onClick={saveOnly}>
          {isPublished ? 'Save changes' : 'Save draft'}
        </Button>
        {isPublished ? null : (
          <Button
            type='button'
            disabled={pending || invalid}
            onClick={() => (willEmail ? setConfirming(true) : publish())}
          >
            Publish
          </Button>
        )}
        <Button type='button' disabled={pending} variant='ghost' onClick={onCancel}>
          Cancel
        </Button>
      </div>

      <DialogAlert open={confirming} onOpenChange={setConfirming}>
        <DialogAlertPortal>
          <DialogAlertBackdrop />
          <DialogAlertPopup>
            <div className='space-y-2'>
              <DialogAlertTitle>Publish and email {learners}?</DialogAlertTitle>
              <DialogAlertDescription>
                The announcement is published in the app and emailed to everyone who has announcement email turned on.
                Emails cannot be recalled once they are sent.
              </DialogAlertDescription>
            </div>
            <div className='mt-6 flex justify-end gap-3'>
              <DialogAlertClose render={<Button type='button' variant='secondary' />}>Cancel</DialogAlertClose>
              <Button type='button' onClick={publish}>
                Publish and email
              </Button>
            </div>
          </DialogAlertPopup>
        </DialogAlertPortal>
      </DialogAlert>
    </section>
  );
}
