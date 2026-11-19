'use client';

import { useState, useTransition } from 'react';

import { Switch } from '@courseroad/iota-ui';

import { setAnnouncementEmailPreference } from '../../actions/announcement-actions';

/** The learner's switch for announcement email. It saves as it changes and puts the switch back if saving fails. */
export function EmailPreferenceSwitch({ initial }: { initial: boolean }) {
  const [enabled, setEnabled] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function change(next: boolean) {
    const previous = enabled;
    setEnabled(next);
    setError(null);
    startTransition(async () => {
      const result = await setAnnouncementEmailPreference({ enabled: next });
      if (!result.success) {
        setEnabled(previous);
        setError(result.error ?? 'Could not save your choice');
      }
    });
  }

  return (
    <div className='flex flex-col gap-1'>
      <label className='flex items-center gap-3 text-sm'>
        <Switch checked={enabled} disabled={pending} aria-label='Email me announcements' onCheckedChange={change} />
        <span>Email me announcements</span>
      </label>
      {error ? (
        <p className='text-danger text-sm' role='alert'>
          {error}
        </p>
      ) : null}
    </div>
  );
}
