'use client';

import { useState, useTransition } from 'react';

import { CreditCard, ExternalLink } from 'lucide-react';

import { Badge, Button, Separator } from '@courseroad/kurume-ui';

type PaymentConnectStatus = 'not_started' | 'pending' | 'complete';

type PaymentConnectCardProps = {
  orgId: string;
  platformFeePercent: number;
  status: PaymentConnectStatus;
  stripeAccountId: string | null;
};

function resolveStatus(stripeAccountId: string | null, onboardingComplete: boolean): PaymentConnectStatus {
  if (!stripeAccountId) return 'not_started';
  if (!onboardingComplete) return 'pending';
  return 'complete';
}

const statusConfig: Record<
  PaymentConnectStatus,
  {
    badge: 'default' | 'destructive' | 'outline' | 'secondary';
    description: string;
    label: string;
  }
> = {
  complete: {
    badge: 'default',
    description: 'Your payment account is fully connected and ready to accept payments.',
    label: 'Connected'
  },
  not_started: {
    badge: 'destructive',
    description: 'Connect a payment account to start accepting course payments.',
    label: 'Not Connected'
  },
  pending: {
    badge: 'secondary',
    description: 'Payment onboarding started but not yet completed. Continue onboarding to activate payments.',
    label: 'Pending'
  }
};

/**
 * Payment Connect integration card for the organization billing settings tab.
 * Allows org owners to initiate onboarding and view connection status.
 */
export function PaymentConnectCard({ orgId, platformFeePercent, status, stripeAccountId }: PaymentConnectCardProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const config = statusConfig[status];

  function handleConnect() {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch('/api/payments/connect', {
          body: JSON.stringify({ organizationId: orgId }),
          headers: { 'Content-Type': 'application/json' },
          method: 'POST'
        });

        if (!res.ok) {
          const text = await res.text();
          setError(text || 'Failed to start onboarding');
          return;
        }

        const { url } = await res.json();
        window.location.href = url;
      } catch {
        setError('Network error. Please try again.');
      }
    });
  }

  return (
    <div className='space-y-4'>
      <div className='space-y-1'>
        <h3 className='text-lg font-semibold'>Billing</h3>
        <p className='text-sm text-muted-foreground'>Manage your payment integration and settings.</p>
      </div>

      <div className='rounded-xl border bg-card p-6'>
        <div className='flex items-start justify-between'>
          <div className='flex items-start gap-4'>
            <div className='flex size-12 items-center justify-center rounded-lg bg-muted'>
              <CreditCard className='size-6 text-muted-foreground' />
            </div>
            <div className='space-y-1'>
              <div className='flex items-center gap-2'>
                <h4 className='font-medium'>Payments Connection</h4>
                <Badge variant={config.badge}>{config.label}</Badge>
              </div>
              <p className='text-sm text-muted-foreground'>{config.description}</p>
            </div>
          </div>
        </div>

        <Separator className='my-4' />

        <div className='flex items-center justify-between'>
          <div className='space-y-1'>
            <p className='text-sm font-medium'>Platform Fee</p>
            <p className='text-sm text-muted-foreground'>
              {platformFeePercent}% of each course sale goes to the platform.
            </p>
          </div>

          {status === 'not_started' && (
            <Button disabled={isPending} isLoading={isPending} variant='default' onClick={handleConnect}>
              <CreditCard className='mr-2 size-4' />
              Connect Stripe
            </Button>
          )}

          {status === 'pending' && (
            <Button disabled={isPending} isLoading={isPending} variant='outline' onClick={handleConnect}>
              Continue Onboarding
            </Button>
          )}

          {status === 'complete' && stripeAccountId && (
            <a
              className='inline-flex items-center gap-2 rounded-lg border bg-background px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted'
              href={`https://dashboard.stripe.com/${stripeAccountId}`}
              rel='noopener noreferrer'
              target='_blank'
            >
              <ExternalLink className='size-4' />
              Stripe Dashboard
            </a>
          )}
        </div>

        {error && <div className='mt-4 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive'>{error}</div>}

        {stripeAccountId && (
          <div className='mt-4 text-xs text-muted-foreground'>
            Account ID: <code className='rounded bg-muted px-1 py-0.5'>{stripeAccountId}</code>
          </div>
        )}
      </div>
    </div>
  );
}

export { resolveStatus };
export type { PaymentConnectStatus };
