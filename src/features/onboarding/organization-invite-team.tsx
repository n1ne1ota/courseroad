'use client';

import type { ChangeEvent } from 'react';
import { useCallback, useState } from 'react';

import { Plus, Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

import { onboardingEmailSchema } from '@/features/onboarding/schemas';
import { Button, Input } from '@courseroad/iota-ui';

const MAX_INVITES = 5;

interface InviteTeamProps {
  emails: string[];
  onEmailsChange: (emails: string[]) => void;
}

/**
 * Invite team step for the onboarding wizard.
 * Allows users to enter up to 5 email addresses to invite to their new workspace.
 * Fully optional — the wizard provides a "Skip" action alongside this step.
 */
export function InviteTeam({ emails, onEmailsChange }: InviteTeamProps) {
  const [validationErrors, setValidationErrors] = useState<Record<number, string>>({});
  const [emailKeys, setEmailKeys] = useState<string[]>(() => emails.map(() => Math.random().toString(36).slice(2, 9)));
  const [prevEmails, setPrevEmails] = useState<string[]>(emails);

  if (emails !== prevEmails) {
    setPrevEmails(emails);
    setEmailKeys(prev => {
      if (emails.length === prev.length) return prev;

      if (emails.length > prev.length) {
        const diff = emails.length - prev.length;
        const newKeys = Array.from({ length: diff }, (_, i) => `sync-${prev.length + i}`);
        return [...prev, ...newKeys];
      }

      return prev.slice(0, emails.length);
    });
  }

  const addEmail = useCallback(() => {
    if (emails.length < MAX_INVITES) {
      setEmailKeys(prev => [...prev, Math.random().toString(36).slice(2, 9)]);
      onEmailsChange([...emails, '']);
    }
  }, [emails, onEmailsChange]);

  const removeEmail = useCallback(
    (index: number) => {
      setEmailKeys(prev => prev.filter((_, i) => i !== index));
      const updated = emails.filter((_, i) => i !== index);
      onEmailsChange(updated);

      // Clean up validation errors
      setValidationErrors(prev => {
        const next = { ...prev };
        delete next[index];

        // Re-index remaining errors
        const reindexed: Record<number, string> = {};
        for (const [key, value] of Object.entries(next)) {
          const oldIndex = Number(key);

          if (oldIndex > index) reindexed[oldIndex - 1] = value;
          else reindexed[oldIndex] = value;
        }
        return reindexed;
      });
    },
    [emails, onEmailsChange]
  );

  const updateEmail = useCallback(
    (index: number, value: string) => {
      const updated = [...emails];
      updated[index] = value;
      onEmailsChange(updated);

      // Clear validation error as user types
      if (validationErrors[index]) {
        setValidationErrors(prev => {
          const next = { ...prev };
          delete next[index];
          return next;
        });
      }
    },
    [emails, onEmailsChange, validationErrors]
  );

  const validateEmail = useCallback(
    (index: number) => {
      const email = emails[index];
      if (email && email.trim() !== '') {
        const validation = onboardingEmailSchema.safeParse(email.trim());
        if (!validation.success) {
          setValidationErrors(prev => ({
            ...prev,
            [index]: validation.error.issues[0]?.message ?? 'Invalid email format'
          }));
        }
      }
    },
    [emails]
  );

  return (
    <div className='flex flex-col gap-2'>
      <AnimatePresence initial={false}>
        {emails.length === 0 && (
          <motion.div
            key='no-teammates-placeholder'
            className='overflow-hidden py-1'
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            initial={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut', type: 'tween' }}
          >
            <div className='pointer-events-none relative flex h-14 w-full items-center justify-center rounded-xl border-[1.5px] border-dashed border-[var(--border)] bg-[var(--input)] px-6 py-2 text-center'>
              <div className='z-[5] flex flex-col gap-0.5'>
                <div className='text-xs font-medium text-foreground/95'>No team members added yet.</div>
                <div className='text-[10px] text-muted-foreground/85'>Click below to invite someone.</div>
              </div>
            </div>
          </motion.div>
        )}

        {emails.map((email, index) => {
          const id = emailKeys[index] || `fallback-${index}`;
          return (
            <motion.div
              key={id}
              className='-m-0.5 flex flex-col gap-1 overflow-hidden p-0.5'
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              initial={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15, ease: 'easeOut', type: 'tween' }}
            >
              <Input
                type='email'
                alwaysShowEndContent
                centerEndContent
                endContent={
                  <Button
                    className='h-7 w-7 min-w-0'
                    isIconOnly
                    color='danger'
                    size='sm'
                    variant='ghost'
                    onPress={() => removeEmail(index)}
                  >
                    <Trash2 className='size-3.5' />
                  </Button>
                }
                label={`Team Member ${(index + 1).toString()}`}
                placeholder='member@company.com'
                value={email}
                aria-label={`Team member email ${(index + 1).toString()}`}
                onBlur={() => validateEmail(index)}
                onChange={(event: ChangeEvent<HTMLInputElement>) => updateEmail(index, event.target.value)}
              />
              {validationErrors[index] && (
                <span className='px-1 text-[10px] text-red-500'>{validationErrors[index]}</span>
              )}
            </motion.div>
          );
        })}

        {emails.length < MAX_INVITES && (
          <div key='add-button-wrapper'>
            <Button
              className='w-full'
              color='secondary'
              size='sm'
              startContent={<Plus className='size-3.5' />}
              variant='solid'
              onPress={addEmail}
            >
              Add Team Member
            </Button>
          </div>
        )}

        <p key='invitation-counter' className='text-center text-[10px] text-muted-foreground'>
          {emails.length}/{MAX_INVITES} invitations
        </p>
      </AnimatePresence>
    </div>
  );
}
