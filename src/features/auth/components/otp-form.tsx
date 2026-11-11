'use client';

import { useEffect, useState, useTransition } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button, Card, InputOTP, Spinner } from '@courseroad/iota-ui';
import { Alert, AlertDescription } from '@courseroad/kurume-ui';
import { motion } from 'motion/react';

import { otpPending, sendOtpVerificationEmail, verifyEmailWithOtp } from '@/lib/auth/auth-client';
import { routes } from '@/lib/routes';

export function OtpForm() {
  const router = useRouter();

  const [email, setEmail] = useState<string | null>(null);
  const [otp, setOtp] = useState('');

  const [isPending, startTransition] = useTransition();
  const [isResending, startResending] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    const pendingEmail = otpPending.getEmail();
    if (!pendingEmail) router.push(routes.signUp);
    else queueMicrotask(() => setEmail(pendingEmail));
  }, [router]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [cooldown]);

  const handleVerify = () => {
    if (!email || otp.length !== 6) return;

    setError(null);
    startTransition(async () => {
      const result = await verifyEmailWithOtp(email, otp);
      if (result.success) router.replace('/api/auth/redirect');
      else setError(result.error?.message || 'Invalid code');
    });
  };

  const handleResend = () => {
    if (!email || cooldown > 0) return;

    startResending(async () => {
      const result = await sendOtpVerificationEmail(email);
      if (result.success) setCooldown(60);
    });
  };

  if (!email) return null; // Or a loading skeleton

  return (
    <div className='flex h-full w-full items-center justify-center'>
      <motion.div
        className='w-full max-w-sm'
        animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
        initial={{ filter: 'blur(4px)', opacity: 0, y: 20 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <Card className='flex w-full flex-col gap-4 p-8'>
          <h1 className='mb-4 text-center text-2xl font-extrabold tracking-tight'>Verify Email</h1>
          <div className='text-center text-sm text-muted-foreground'>
            <p>Enter the 6-digit code sent to</p>
            <p className='mt-1 font-semibold text-foreground'>{email}</p>
          </div>

          {error && (
            <Alert variant='destructive'>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className='flex justify-center py-2'>
            <InputOTP autoFocus color='primary' disabled={isPending} maxLength={6} value={otp} onChange={setOtp} />
          </div>

          <div className='flex flex-col gap-2'>
            <Button
              className='w-full'
              type='button'
              color='primary'
              disabled={otp.length !== 6 || isPending}
              isLoading={isPending}
              spinner={<Spinner color='current' size='sm' />}
              onClick={handleVerify}
            >
              {isPending ? 'Verifying' : 'Verify Code'}
            </Button>

            <Button
              className='w-full'
              type='button'
              color='secondary'
              disabled={cooldown > 0 || isResending}
              isLoading={isResending}
              spinner={<Spinner color='current' size='sm' />}
              onClick={handleResend}
            >
              {cooldown > 0 ? `Resend Code (${cooldown}s)` : 'Resend Code'}
            </Button>
          </div>

          <p className='mt-3 text-center text-sm'>
            Need a different email?&nbsp;
            <Link className='text-link text-sm' href={routes.signUp}>
              Back to Sign Up
            </Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
