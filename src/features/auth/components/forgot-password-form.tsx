'use client';

import { useState, useTransition } from 'react';

import Link from 'next/link';

import { AltArrowLeft as ArrowLeftIcon } from '@solar-icons/react-perf/Linear';
import { AnimatePresence, motion } from 'motion/react';

import { requestPasswordResetEmail } from '@/lib/auth/auth-client';
import { routes } from '@/lib/routes';

import { Button, Card, Input, Spinner } from '@courseroad/iota-ui';
import { Alert, AlertDescription } from '@courseroad/kurume-ui';

export function ForgotPasswordForm() {
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAction = (formData: FormData) => {
    const email = formData.get('email') as string;

    setError(null);
    startTransition(async () => {
      const result = await requestPasswordResetEmail(email);
      if (result.success) {
        setIsSuccess(true);
      } else {
        setError(result.error?.message || 'An error occurred. Please try again.');
      }
    });
  };

  return (
    <div className='flex h-full w-full items-center justify-center'>
      <Card className='relative flex w-full max-w-sm flex-col gap-4 overflow-hidden p-8'>
        <AnimatePresence mode='wait'>
          {isSuccess ? (
            <motion.div
              key='success'
              className='flex flex-col gap-4 text-center'
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              initial={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/20 text-success'>
                <svg className='h-6 w-6' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'>
                  <path d='M5 13l4 4L19 7' strokeLinecap='round' strokeLinejoin='round' />
                </svg>
              </div>
              <h1 className='text-center text-2xl font-extrabold tracking-tight'>Check your email</h1>
              <p className='text-sm text-muted-foreground'>
                If an account exists, a reset link has been sent to the email address provided.
              </p>
              <Button className='mt-2 w-full' color='primary' render={<Link href={routes.signIn} />} variant='flat'>
                Return to Sign In
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key='form'
              className='flex flex-col gap-4'
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              initial={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className='flex flex-col gap-2'>
                <h1 className='text-center text-2xl font-extrabold tracking-tight'>Reset Password</h1>
                <p className='text-sm text-muted-foreground'>
                  Enter your email address and we&apos;ll send you a link to reset your password.
                </p>
              </div>

              {error && (
                <Alert variant='destructive'>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form className='flex flex-col gap-4' action={handleAction}>
                <Input name='email' type='email' autoFocus isRequired label='Email Address' />
                <Button
                  className='w-full'
                  type='submit'
                  color='primary'
                  isLoading={isPending}
                  spinner={<Spinner color='current' size='sm' />}
                >
                  {isPending ? 'Sending Link' : 'Send Reset Link'}
                </Button>
              </form>

              <div className='mt-2 flex justify-center'>
                <Link
                  className='flex text-link items-center gap-2 text-sm font-medium transition-opacity hover:opacity-80'
                  href={routes.signIn}
                >
                  <ArrowLeftIcon size={16} />
                  Back to Sign In
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
}
