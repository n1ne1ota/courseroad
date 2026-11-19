'use client';

import { useState, useTransition } from 'react';

import type { Route } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button, Card, Spinner } from '@courseroad/iota-ui';

import { authClient, otpPending, sendOtpVerificationEmail } from '@/lib/auth/auth-client';
import { createAuthUrl } from '@/lib/auth/callback-url';
import { isOrganizationMemberRole, organizationRoleLabels } from '@/lib/auth/org-role-policy';
import { invitationRoute } from '@/lib/routes/org';

import { acceptInvitation } from '@/features/organization/actions/invitation-actions';

import type { InvitationEntry } from '@/features/organization/invitation-contract';

const messages = {
  'signed-out': 'Sign in or create an account using the email address that received this invitation.',
  unverified: 'Verify your email before viewing or accepting this invitation.',
  'wrong-account': 'This invitation belongs to a different email address. Sign in with the account that received it.',
  unknown: 'This invitation could not be found. Ask the organization owner for a new invitation.',
  expired: 'This invitation has expired. Ask the organization owner for a new invitation.',
  cancelled: 'This invitation was cancelled or declined. Ask the organization owner for a new invitation.',
  unavailable: 'This invitation is unavailable. Refresh to retry, or ask the organization owner for a new invitation.'
};

/** Recipient continuation and explicit acceptance; no membership role can be selected here. */
export function AcceptInvitation({ invitationId, entry }: { invitationId: string; entry: InvitationEntry }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const callback = invitationRoute(invitationId);
  const signIn = createAuthUrl('/sign-in', callback) as Route;
  const detailed = entry.status === 'pending' || entry.status === 'accepted';
  const message = 'organizationName' in entry ? undefined : messages[entry.status];

  function accept() {
    setError(null);
    startTransition(async () => {
      try {
        const result = await acceptInvitation({ invitationId });
        if (!result.success || !result.data) {
          setError(result.error ?? 'Could not finish joining. Retry to continue without creating another membership.');
          return;
        }
        router.push(result.data.destination);
      } catch {
        setError('Could not finish joining. Retry to continue without creating another membership.');
      }
    });
  }

  function switchAccount() {
    setError(null);
    startTransition(async () => {
      try {
        const result = await authClient.signOut();
        if (result.error) throw new Error('Sign-out failed.');
        router.push(signIn);
        router.refresh();
      } catch {
        setError('Could not sign out. Try again.');
      }
    });
  }

  function verify() {
    setError(null);
    startTransition(async () => {
      try {
        const session = await authClient.getSession();
        const email = session.data?.user.email;
        if (!email) throw new Error('Sign in again to verify your email.');
        const result = await sendOtpVerificationEmail(email);
        if (!result.success) throw new Error(result.error.message);
        otpPending.setEmail(email);
        router.push(createAuthUrl('/otp', callback) as Route);
      } catch {
        setError('Could not send a verification code. Try again.');
      }
    });
  }

  return (
    <div className='flex flex-1 items-center justify-center p-4'>
      <Card className='w-full max-w-md space-y-5 p-8'>
        <h1 className='text-2xl font-bold'>
          {detailed ? `Join ${entry.organizationName}` : 'Organization invitation'}
        </h1>
        {detailed ? (
          <div className='space-y-2 text-sm text-muted-foreground'>
            <p>
              {entry.status === 'accepted'
                ? 'You have accepted this invitation. Continue to your organization.'
                : 'Accept this invitation to join the organization.'}
            </p>
            <p>Role: {isOrganizationMemberRole(entry.role) ? organizationRoleLabels[entry.role] : entry.role}</p>
            {entry.inviterEmail && <p>Invited by {entry.inviterEmail}</p>}
            {entry.status === 'pending' && (
              <p>
                Expires:{' '}
                <time dateTime={entry.expiresAt}>
                  {new Date(entry.expiresAt).toLocaleString('en-GB', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                    timeZone: 'UTC'
                  })}{' '}
                  UTC
                </time>
              </p>
            )}
          </div>
        ) : (
          <p className='text-sm text-muted-foreground'>{message}</p>
        )}
        {error && (
          <p className='text-sm text-destructive' role='alert'>
            {error} You can retry this step.
          </p>
        )}
        {detailed && (
          <Button disabled={pending} isLoading={pending} spinner={<Spinner size='sm' />} onPress={accept}>
            {entry.status === 'accepted' ? 'Continue to organization' : 'Accept invitation'}
          </Button>
        )}
        {entry.status === 'signed-out' && (
          <div className='flex gap-4'>
            <Link className='text-link' href={signIn}>
              Sign in
            </Link>
            <Link className='text-link' href={createAuthUrl('/sign-up', callback) as Route}>
              Create account
            </Link>
          </div>
        )}
        {entry.status === 'unverified' && (
          <Button disabled={pending} isLoading={pending} onPress={verify}>
            Send verification code
          </Button>
        )}
        {(entry.status === 'wrong-account' || entry.status === 'unverified' || detailed) && (
          <Button disabled={pending} variant='secondary' onPress={switchAccount}>
            Use a different account
          </Button>
        )}
        {entry.status === 'unavailable' && (
          <Button variant='secondary' onPress={() => router.refresh()}>
            Refresh invitation
          </Button>
        )}
      </Card>
    </div>
  );
}
