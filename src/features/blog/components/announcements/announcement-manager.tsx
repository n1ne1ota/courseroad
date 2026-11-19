'use client';

import { useState, useTransition } from 'react';

import { useRouter } from 'next/navigation';

import {
  Button,
  Chip,
  DialogAlert,
  DialogAlertBackdrop,
  DialogAlertClose,
  DialogAlertDescription,
  DialogAlertPopup,
  DialogAlertPortal,
  DialogAlertTitle
} from '@courseroad/iota-ui';

import { deleteAnnouncement, pinAnnouncement, publishAnnouncement } from '../../actions/announcement-actions';
import { formatAnnouncementDate } from '../../lib/announcement-format';
import { describePublishOutcome } from '../../lib/announcement-messages';
import { AnnouncementComposer, type ComposerInitial } from './announcement-composer';

import type { AuthoringTarget } from '../../schemas/announcement-schemas';
import type { AuthoredAnnouncement } from '../../types/announcement-types';

const EMAIL_CHIPS = {
  Failed: { color: 'destructive', label: 'Email failed' },
  None: null,
  Partial: { color: 'warning', label: 'Email partly sent' },
  Sent: { color: 'success', label: 'Emailed' }
} as const;

interface ManagerProps {
  audience: { cap: number; count: number };
  items: AuthoredAnnouncement[];
  target: AuthoringTarget;
}

/** The authored announcements of one course or organization as a table, with the composer above it. */
export function AnnouncementManager({ audience, items, target }: ManagerProps) {
  const router = useRouter();
  const [composing, setComposing] = useState<{ initial: ComposerInitial | null } | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<AuthoredAnnouncement | null>(null);
  const [pending, startTransition] = useTransition();

  function done(text: string) {
    setComposing(null);
    setMessage(text);
    setError(null);
    router.refresh();
  }

  function run(task: () => Promise<{ error?: string | undefined; message?: string; success: boolean }>) {
    setError(null);
    startTransition(async () => {
      const result = await task();
      if (!result.success) {
        setError(result.error ?? 'Something went wrong');
        return;
      }
      if (result.message) setMessage(result.message);
      router.refresh();
    });
  }

  return (
    <div className='flex flex-col gap-6'>
      {composing ? (
        <AnnouncementComposer
          key={composing.initial?.id ?? 'new'}
          audience={audience}
          initial={composing.initial}
          target={target}
          onCancel={() => setComposing(null)}
          onDone={done}
        />
      ) : (
        <div>
          <Button type='button' onClick={() => setComposing({ initial: null })}>
            New announcement
          </Button>
        </div>
      )}

      {message ? (
        <p className='text-sm' role='status'>
          {message}
        </p>
      ) : null}
      {error ? (
        <p className='text-danger text-sm' role='alert'>
          {error}
        </p>
      ) : null}

      {items.length === 0 ? (
        <p className='text-muted-foreground'>No announcements yet.</p>
      ) : (
        <div className='overflow-x-auto rounded-xl border border-border'>
          <table className='w-full text-left text-sm'>
            <caption className='sr-only'>Announcements</caption>
            <thead className='border-b border-border text-muted-foreground'>
              <tr>
                <th className='px-4 py-3 font-medium' scope='col'>
                  Title
                </th>
                <th className='px-4 py-3 font-medium' scope='col'>
                  Status
                </th>
                <th className='px-4 py-3 font-medium' scope='col'>
                  Published
                </th>
                <th className='px-4 py-3 text-end font-medium' scope='col'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => {
                const emailChip = EMAIL_CHIPS[item.emailStatus];
                return (
                  <tr key={item.id} className='border-b border-border last:border-0'>
                    <th className='px-4 py-3 font-medium' scope='row'>
                      {item.title}
                      {item.pinned ? (
                        <span className='ms-2 text-xs font-normal text-muted-foreground'>Pinned</span>
                      ) : null}
                    </th>
                    <td className='px-4 py-3'>
                      <div className='flex flex-wrap gap-2'>
                        <Chip color={item.status === 'Published' ? 'success' : 'default'} size='sm' variant='flat'>
                          {item.status}
                        </Chip>
                        {emailChip ? (
                          <Chip color={emailChip.color} size='sm' variant='flat'>
                            {emailChip.label}
                            {item.emailRecipientCount === null ? '' : ` (${item.emailRecipientCount})`}
                          </Chip>
                        ) : null}
                      </div>
                    </td>
                    <td className='px-4 py-3 text-muted-foreground'>
                      {formatAnnouncementDate(item.publishedAt) || '-'}
                    </td>
                    <td className='px-4 py-3'>
                      <div className='flex flex-wrap justify-end gap-2'>
                        <Button
                          type='button'
                          size='sm'
                          variant='ghost'
                          onClick={() =>
                            setComposing({
                              initial: {
                                bodyHtml: item.bodyHtml,
                                id: item.id,
                                pinned: item.pinned,
                                status: item.status,
                                title: item.title
                              }
                            })
                          }
                        >
                          Edit
                        </Button>
                        <Button
                          type='button'
                          disabled={pending}
                          size='sm'
                          variant='ghost'
                          onClick={() =>
                            run(() =>
                              pinAnnouncement({
                                announcementId: item.id,
                                pinned: !item.pinned
                              })
                            )
                          }
                        >
                          {item.pinned ? 'Unpin' : 'Pin'}
                        </Button>
                        {item.status === 'Draft' ? (
                          <Button
                            type='button'
                            disabled={pending}
                            size='sm'
                            variant='ghost'
                            onClick={() =>
                              run(async () => {
                                const result = await publishAnnouncement({
                                  announcementId: item.id,
                                  sendEmail: false
                                });
                                return {
                                  ...result,
                                  message: result.success ? describePublishOutcome(null) : ''
                                };
                              })
                            }
                          >
                            Publish
                          </Button>
                        ) : null}
                        <Button
                          type='button'
                          color='destructive'
                          disabled={pending}
                          size='sm'
                          variant='ghost'
                          onClick={() => setDeleting(item)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <DialogAlert open={deleting !== null} onOpenChange={open => (open ? undefined : setDeleting(null))}>
        <DialogAlertPortal>
          <DialogAlertBackdrop />
          <DialogAlertPopup>
            <div className='space-y-2'>
              <DialogAlertTitle>Delete this announcement?</DialogAlertTitle>
              <DialogAlertDescription>
                Learners will no longer see {deleting ? `“${deleting.title}”` : 'it'}. Emails that were already sent
                cannot be recalled.
              </DialogAlertDescription>
            </div>
            <div className='mt-6 flex justify-end gap-3'>
              <DialogAlertClose render={<Button type='button' variant='secondary' />}>Cancel</DialogAlertClose>
              <Button
                type='button'
                color='destructive'
                onClick={() => {
                  const target = deleting;
                  setDeleting(null);
                  if (target) {
                    run(async () => ({
                      ...(await deleteAnnouncement({ announcementId: target.id })),
                      message: 'Announcement deleted.'
                    }));
                  }
                }}
              >
                Delete
              </Button>
            </div>
          </DialogAlertPopup>
        </DialogAlertPortal>
      </DialogAlert>
    </div>
  );
}
