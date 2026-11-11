'use client';

import { useActionState } from 'react';

import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';

import { Alert, AlertDescription, AlertTitle } from '@kurume-ui/core/components/alert/alert';
import { Button } from '@kurume-ui/core/components/button/button';

interface CheckoutFormProps {
  courseId: string;
  returnUrl: string;
}

export function CheckoutForm({ returnUrl }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const [errorMessage, submitAction, isPending] = useActionState(async (_prevState: string | undefined) => {
    // Stripe.js hasn't yet loaded.
    if (!stripe || !elements) return undefined;

    const { error } = await stripe.confirmPayment({
      // `Elements` instance that was used to create the Payment Element
      confirmParams: {
        return_url: returnUrl
      },
      elements
    });

    if (error) {
      // This point will only be reached if there is an immediate error when
      // confirming the payment. Show error to your customer (for example, payment
      // details incomplete)
      return error.message;
    }

    // Your customer will be redirected to your `return_url`. For some payment
    // methods like iDEAL, your customer will be redirected to an intermediate
    // site first to authorize the payment, then redirected to the `return_url`.
    return undefined;
  }, undefined);

  return (
    <form className='flex flex-col gap-6' action={submitAction}>
      <PaymentElement
        className='*:focus:outline-none [&>iframe]:focus:outline-none'
        id='payment-element'
        options={{ layout: 'tabs' }}
      />

      {errorMessage && (
        <Alert variant='destructive'>
          <AlertTitle>Payment failed</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <Button
        className='w-full'
        id='submit'
        type='submit'
        disabled={isPending || !stripe || !elements}
        isLoading={isPending}
        size='lg'
      >
        {isPending ? 'Processing...' : 'Pay now'}
      </Button>
    </form>
  );
}
