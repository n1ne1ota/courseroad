'use client';

import type { ReactNode } from 'react';

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useTheme } from 'next-themes';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface PaymentCheckoutWrapperProps {
  children: ReactNode;
  clientSecret: string;
}

export function PaymentCheckoutWrapper({ children, clientSecret }: PaymentCheckoutWrapperProps) {
  const { resolvedTheme } = useTheme();

  return (
    <Elements
      options={{
        appearance: {
          rules: {
            '.Input': {
              backgroundColor: 'transparent',
              border: `1px solid ${resolvedTheme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)'}`,
              boxShadow: 'none',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
            },
            '.Input--invalid': {
              borderColor: '#ef4444',
              boxShadow: 'none'
            },
            '.Input:focus': {
              borderColor: '#0054ff',
              boxShadow: '0 0 0 1px #0054ff'
            },
            '.PickerItem': {
              backgroundColor: 'transparent',
              color: resolvedTheme === 'dark' ? '#fafafa' : '#09090b'
            },
            '.PickerItem--highlight': {
              backgroundColor: resolvedTheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
              color: resolvedTheme === 'dark' ? '#fafafa' : '#09090b'
            },
            '.PickerItem--selected': {
              backgroundColor: '#0054ff', // Kurume Electric Blue
              color: '#ffffff'
            },
            '.Tab': {
              backgroundColor: 'transparent',
              border: `1px solid ${resolvedTheme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)'}`,
              boxShadow: 'none'
            },
            '.Tab--selected': {
              backgroundColor: resolvedTheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
              borderColor: '#0054ff',
              color: resolvedTheme === 'dark' ? '#ffffff' : '#000000'
            },
            '.Tab:hover': {
              backgroundColor: resolvedTheme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'
            }
          },
          theme: resolvedTheme === 'dark' ? 'night' : 'stripe',
          variables: {
            borderRadius: '8px', // var(--radius-md)
            colorBackground: resolvedTheme === 'dark' ? '#000000' : '#ffffff',
            colorDanger: '#ef4444',
            colorPrimary: '#0054ff', // Kurume Electric Blue
            colorText: resolvedTheme === 'dark' ? '#fafafa' : '#09090b',
            fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }
        },
        clientSecret
      }}
      stripe={stripePromise}
    >
      {children}
    </Elements>
  );
}
