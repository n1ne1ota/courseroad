'use client';

import type { JSX } from 'react';
import { useState, useTransition } from 'react';

import { Badge, Button, Separator } from '@kurume-ui/core';
import { CreditCard, ExternalLink } from 'lucide-react';

import {
  getCreatorStripeDashboardLink,
  startCreatorStripeOnboarding
} from '@/features/payment/actions/creator-actions';

type StripeConnectStatus = 'not_started' | 'pending' | 'complete';

type PayoutSetupCardProps = {
  platformFeePercent?: number;
  stripeAccountId: string | null;
  stripeOnboardingComplete: boolean;
};

function resolveStatus(stripeAccountId: string | null, onboardingComplete: boolean): StripeConnectStatus {
  if (!stripeAccountId) return 'not_started';
  if (!onboardingComplete) return 'pending';
  return 'complete';
}

const statusConfig: Record<
  StripeConnectStatus,
  {
    badge: 'default' | 'destructive' | 'outline' | 'secondary';
    description: string;
    label: string;
  }
> = {
  complete: {
    badge: 'default',
    description: 'Your Stripe account is fully connected and ready to receive direct payouts.',
    label: 'Connected'
  },
  not_started: {
    badge: 'destructive',
    description: 'Connect a Stripe Express account to start receiving direct payouts from your course sales.',
    label: 'Not Connected'
  },
  pending: {
    badge: 'secondary',
    description: 'Stripe onboarding started but not yet completed. Continue onboarding to enable direct payouts.',
    label: 'Pending'
  }
};

export function PayoutSetupCard({
  platformFeePercent = 10,
  stripeAccountId,
  stripeOnboardingComplete
}: PayoutSetupCardProps): JSX.Element {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const status = resolveStatus(stripeAccountId, stripeOnboardingComplete);
  const config = statusConfig[status];

  const handleConnect = () => {
    setError(null);
    startTransition(async () => {
      try {
        const result = await startCreatorStripeOnboarding({});
        if (result.success && result.data?.url) {
          window.location.href = result.data.url;
        } else {
          setError(result.error || 'Failed to start Stripe onboarding.');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred.');
      }
    });
  };

  const handleDashboard = () => {
    setError(null);
    startTransition(async () => {
      try {
        const result = await getCreatorStripeDashboardLink({});
        if (result.success && result.data?.url) {
          if (typeof window !== 'undefined') {
            if (window.open) {
              window.open(result.data.url, '_blank', 'noopener,noreferrer');
            } else {
              window.location.href = result.data.url;
            }
          }
        } else {
          setError(result.error || 'Failed to generate dashboard link.');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred.');
      }
    });
  };

  return (
    <div className='space-y-4'>
      <div className='space-y-1'>
        <h3 className='text-lg font-semibold text-foreground'>Payouts & Stripe Connect</h3>
        <p className='text-sm text-muted-foreground'>
          Configure how you receive payouts for courses sold directly to learners.
        </p>
      </div>

      <div className='border-default-200/50 rounded-3xl border bg-background/40 p-6 shadow-sm backdrop-blur-md'>
        <div className='flex items-start justify-between'>
          <div className='flex items-start gap-4'>
            <div className='flex size-12 shrink-0 items-center justify-center rounded-2xl bg-muted/40 text-muted-foreground'>
              <CreditCard className='size-6' />
            </div>
            <div className='space-y-1'>
              <div className='flex items-center gap-2'>
                <h4 className='font-medium text-foreground'>Direct Payout Account</h4>
                <Badge variant={config.badge}>{config.label}</Badge>
              </div>
              <p className='text-sm text-muted-foreground'>{config.description}</p>
            </div>
          </div>
        </div>

        <Separator className='border-default-200/50 my-4' />

        <div className='flex flex-wrap items-center justify-between gap-4'>
          <div className='space-y-1'>
            <p className='text-sm font-medium text-foreground'>Platform Service Fee</p>
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
            <Button disabled={isPending} isLoading={isPending} variant='outline' onClick={handleDashboard}>
              <ExternalLink className='mr-2 size-4' />
              Stripe Dashboard
            </Button>
          )}
        </div>

        {error && <div className='mt-4 rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive'>{error}</div>}

        {stripeAccountId && (
          <div className='mt-4 text-xs text-muted-foreground'>
            Stripe Account ID: <code className='rounded bg-muted px-1.5 py-0.5'>{stripeAccountId}</code>
          </div>
        )}
      </div>
    </div>
  );
}
