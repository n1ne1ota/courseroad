'use client';

import { useState, useTransition } from 'react';

import type { Route } from 'next';
import { useRouter, useSearchParams } from 'next/navigation';

import { motion } from 'motion/react';

import { authClient } from '@/lib/auth/auth-client';
import { getCallbackUrl } from '@/lib/auth/callback-url';

import { Button, Card, InputOTP, Spinner } from '@courseroad/iota-ui';
import { Alert, AlertDescription } from '@courseroad/kurume-ui';

import { HomeButton } from './home-button';

export function TwoFactorForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [code, setCode] = useState('');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const callbackUrl = getCallbackUrl(searchParams, '/api/auth/redirect');

  const handleVerify = () => {
    if (code.length !== 6) return;

    setError(null);
    startTransition(async () => {
      try {
        const result = await authClient.twoFactor.verifyTotp({
          code,
          trustDevice: true
        });

        if (result.error) {
          setError(result.error.message || 'Invalid 2FA code. Please try again.');
          return;
        }

        router.push(callbackUrl as Route);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
        setError(message);
      }
    });
  };

  return (
    <div className='flex h-full w-full items-center justify-center'>
      <motion.div
        className='w-full max-w-sm'
        animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
        initial={{ filter: 'blur(4px)', opacity: 0, y: 20 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <HomeButton />
        <Card className='flex w-full flex-col gap-4 p-8'>
          <h1 className='mb-4 text-center text-2xl font-extrabold tracking-tight'>Two-Factor Authentication</h1>
          <p className='text-center text-sm text-muted-foreground'>
            Enter the 6-digit security code from your authenticator app to sign in.
          </p>

          {error && (
            <Alert variant='destructive'>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className='flex justify-center py-2'>
            <InputOTP autoFocus color='primary' disabled={isPending} maxLength={6} value={code} onChange={setCode} />
          </div>

          <Button
            className='w-full'
            type='button'
            color='primary'
            disabled={code.length !== 6 || isPending}
            isLoading={isPending}
            spinner={<Spinner color='current' size='sm' />}
            onClick={handleVerify}
          >
            {isPending ? 'Verifying' : 'Verify Code'}
          </Button>
        </Card>
      </motion.div>
    </div>
  );
}
