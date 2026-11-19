'use client';
import { useEffect, useRef, useState } from 'react';

import { env } from '@/lib/config/env';

import { createPaymentIntent } from '@/features/payment/actions/payment-intent-actions';

import type { ActionState } from '@/types/action.types';

import { CheckoutForm } from './checkout-form';
import { PaymentCheckoutWrapper } from './payment-checkout-wrapper';

/** Initialize checkout through its mutation action when the browser opens checkout. */
export function CheckoutInitializer({
  courseId,
  returnUrl,
  initialize
}: {
  courseId: string;
  returnUrl: string;
  initialize?: () => Promise<ActionState<string>>;
}) {
  const started = useRef(false);
  const [secret, setSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!env.NEXT_PUBLIC_PAYMENTS_ENABLED || started.current) return;
    started.current = true;
    void (initialize ? initialize() : createPaymentIntent({ courseId }))
      .then(result => {
        if (result.success && result.data) setSecret(result.data);
        else setError(result.error ?? 'Failed to initialize payment gateway.');
      })
      .catch(() => setError('Failed to initialize payment gateway.'));
  }, [courseId, initialize]);
  if (!env.NEXT_PUBLIC_PAYMENTS_ENABLED) return <p role='status'>Payments are not enabled in this environment.</p>;
  if (error) return <p role='alert'>{error}</p>;
  if (!secret) return <p role='status'>Preparing checkout…</p>;
  return (
    <PaymentCheckoutWrapper clientSecret={secret}>
      <CheckoutForm courseId={courseId} returnUrl={returnUrl} />
    </PaymentCheckoutWrapper>
  );
}
