'use client';

import { useEffect, useState, useTransition } from 'react';

import type { Route } from 'next';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { Button, Card, Checkbox, Chip, Input, Spinner, TabsLine } from '@courseroad/iota-ui';
import { Alert, AlertDescription } from '@courseroad/kurume-ui';
import { Letter as LetterIcon } from '@solar-icons/react-perf/Bold';
import { AltArrowLeft as ArrowLeftIcon, KeyMinimalistic as PasskeyIcon } from '@solar-icons/react-perf/Linear';
import { AnimatePresence, motion } from 'motion/react';

import {
  preloadPasskeyAutofill,
  signInWithEmail,
  signInWithGitHub,
  signInWithGoogle,
  signInWithMagicLink,
  signInWithPasskey
} from '@/lib/auth/auth-client';
import { getCallbackUrl } from '@/lib/auth/callback-url';
import { useLastLoginMethod } from '@/lib/auth/use-last-login-method';
import { usePasskeySupported } from '@/lib/auth/use-passkey-support';
import { routes } from '@/lib/routes';

import { GitHubIcon } from '@/assets/icons/github-icon';
import { GoogleColorIcon as GoogleIcon } from '@/assets/icons/google-icon';

import { HomeButton } from './home-button';

type LastUsedBadgeVariant = 'primary' | 'secondary';

function LastUsedBadge({ variant }: { variant: LastUsedBadgeVariant }) {
  return (
    <div className='pointer-events-none absolute inset-0 z-10 overflow-visible' aria-hidden>
      <Chip
        className={`absolute top-0 right-0 translate-x-1/4 -translate-y-1/2 px-1.5 py-0 text-[10px] leading-tight font-medium ${
          variant === 'primary' ? 'bg-white/20 text-white' : ''
        }`}
        color={variant === 'secondary' ? 'primary' : undefined}
        variant='flat'
      >
        Last used
      </Chip>
    </div>
  );
}

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showEmailForm, setShowEmailForm] = useState<boolean>(false);
  const [loginMode, setLoginMode] = useState<'password' | 'magic-link'>('password');

  const loginModeOptions = [
    { label: 'Password', value: 'password' },
    { label: 'Magic Link', value: 'magic-link' }
  ] as const;
  const [magicLinkSent, setMagicLinkSent] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [isEmailPending, startEmailTransition] = useTransition();
  const [isGooglePending, startGoogleTransition] = useTransition();
  const [isGitHubPending, startGitHubTransition] = useTransition();
  const [isPasskeyPending, startPasskeyTransition] = useTransition();
  const passkeySupported = usePasskeySupported();
  const lastLoginMethod = useLastLoginMethod();

  const callbackUrl = getCallbackUrl(searchParams, '/api/auth/redirect');

  useEffect(() => {
    if (!passkeySupported) return;
    // Surface registered passkeys in the browser's autofill menu (conditional UI).
    void preloadPasskeyAutofill().then(isSignedIn => {
      if (isSignedIn) router.push(callbackUrl as Route);
    });
  }, [callbackUrl, passkeySupported, router]);

  const handleEmailAction = (formData: FormData) => {
    const email = String(formData.get('email') || '').trim();

    setError(null);
    if (loginMode === 'magic-link') {
      startEmailTransition(async () => {
        const result = await signInWithMagicLink(email, callbackUrl);
        if (!result.success) {
          setError(result.error?.message || 'Failed to send magic link.');
          return;
        }
        setMagicLinkSent(true);
      });
      return;
    }

    const password = String(formData.get('password') || '');
    startEmailTransition(async () => {
      const result = await signInWithEmail(email, password);

      if (!result.success) {
        setError(result.error?.message || 'An error occurred. Please try again.');
        return;
      }
      router.push(callbackUrl as Route);
    });
  };

  const handleGoogleSignIn = () => {
    startGoogleTransition(async () => {
      await signInWithGoogle(callbackUrl);
    });
  };

  const handleGitHubSignIn = () => {
    startGitHubTransition(async () => {
      await signInWithGitHub(callbackUrl);
    });
  };

  const handlePasskeySignIn = () => {
    startPasskeyTransition(async () => {
      const result = await signInWithPasskey();
      if (result.success) router.push(callbackUrl as Route);
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
        {!showEmailForm && <HomeButton />}
        <Card className='flex w-full flex-col gap-4 p-8'>
          <h1 className='mb-4 text-center text-2xl font-extrabold tracking-tight'>Sign In</h1>

          <AnimatePresence mode='wait'>
            {showEmailForm ? (
              <motion.div
                key='email-form'
                className='flex flex-col gap-4'
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                initial={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
              >
                {error && (
                  <Alert className='mb-2' variant='destructive'>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {!magicLinkSent && (
                  <TabsLine
                    className='mb-4'
                    fullWidth
                    options={loginModeOptions}
                    value={loginMode}
                    variant='secondary'
                    onValueChange={val => {
                      setError(null);
                      setLoginMode(val);
                    }}
                  />
                )}
                <form className='flex flex-col gap-3' action={handleEmailAction}>
                  <Input
                    name='email'
                    type='email'
                    autoFocus
                    isRequired
                    autoComplete='username webauthn'
                    label='Email Address'
                  />
                  <AnimatePresence mode='wait'>
                    {loginMode === 'password' ? (
                      <motion.div
                        key='password-fields'
                        className='flex flex-col gap-3'
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        initial={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15, ease: 'easeInOut' }}
                      >
                        <Input
                          name='password'
                          type='password'
                          isRequired
                          autoComplete='current-password'
                          label='Password'
                        />
                        <div className='flex w-full items-center justify-between px-1 py-2'>
                          <Checkbox name='remember' size='sm'>
                            Remember me
                          </Checkbox>
                          <Link className='text-link text-sm' href={routes.resetPassword}>
                            Forgot password?
                          </Link>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key='magic-link-fields'
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        initial={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15, ease: 'easeInOut' }}
                      >
                        <p className='px-1 py-1 text-xs text-muted-foreground'>
                          We will email you a secure link to log in without a password.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {magicLinkSent ? (
                    <>
                      <Alert className='mb-2' variant='default'>
                        <AlertDescription>
                          Check your email! We sent a secure sign-in link to your inbox.
                        </AlertDescription>
                      </Alert>
                      <Button
                        type='button'
                        fullWidth
                        color='secondary'
                        startContent={<ArrowLeftIcon className='text-muted-foreground' size={18} />}
                        onPress={() => setShowEmailForm(false)}
                      >
                        Back
                      </Button>
                    </>
                  ) : (
                    <div className='mt-2 flex gap-3'>
                      <Button
                        className='flex-1'
                        type='button'
                        color='secondary'
                        startContent={<ArrowLeftIcon className='text-muted-foreground' size={18} />}
                        onPress={() => setShowEmailForm(false)}
                      >
                        Back
                      </Button>
                      <Button
                        className='flex-1'
                        type='submit'
                        color='primary'
                        isLoading={isEmailPending}
                        spinner={<Spinner color='current' size='sm' />}
                      >
                        {isEmailPending
                          ? loginMode === 'password'
                            ? 'Signing In'
                            : 'Sending'
                          : loginMode === 'password'
                            ? 'Sign In'
                            : 'Send'}
                      </Button>
                    </div>
                  )}
                </form>
              </motion.div>
            ) : (
              <motion.div
                key='oauth-form'
                className='flex flex-col gap-4'
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                initial={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
              >
                <div className='relative isolate'>
                  <Button
                    type='button'
                    fullWidth
                    color='primary'
                    startContent={<LetterIcon className='pointer-events-none' size={20} />}
                    onPress={() => setShowEmailForm(true)}
                  >
                    Continue with Email
                  </Button>
                  {(lastLoginMethod === 'email' || lastLoginMethod === 'magic-link') && (
                    <LastUsedBadge variant='primary' />
                  )}
                </div>
                <div className='flex items-center gap-4 py-2'>
                  <hr className='flex-1 border-t border-border' />
                  <p className='shrink-0 text-xs text-muted-foreground'>OR</p>
                  <hr className='flex-1 border-t border-border' />
                </div>
                <div className='flex flex-col gap-2'>
                  <div className='relative isolate'>
                    <Button
                      fullWidth
                      color='secondary'
                      isLoading={isGooglePending}
                      spinner={<Spinner color='current' size='sm' />}
                      startContent={!isGooglePending && <GoogleIcon height={24} width={24} />}
                      onPress={handleGoogleSignIn}
                    >
                      {isGooglePending ? 'Signing In' : 'Continue with Google'}
                    </Button>
                    {lastLoginMethod === 'google' && <LastUsedBadge variant='secondary' />}
                  </div>
                  <div className='relative isolate'>
                    <Button
                      fullWidth
                      color='secondary'
                      isLoading={isGitHubPending}
                      spinner={<Spinner color='current' size='sm' />}
                      startContent={!isGitHubPending && <GitHubIcon height={24} width={24} />}
                      onPress={handleGitHubSignIn}
                    >
                      {isGitHubPending ? 'Signing In' : 'Continue with GitHub'}
                    </Button>
                    {lastLoginMethod === 'github' && <LastUsedBadge variant='secondary' />}
                  </div>
                  {passkeySupported && (
                    <div className='relative isolate'>
                      <Button
                        fullWidth
                        color='secondary'
                        isLoading={isPasskeyPending}
                        spinner={<Spinner color='current' size='sm' />}
                        startContent={!isPasskeyPending && <PasskeyIcon height={24} width={24} />}
                        onPress={handlePasskeySignIn}
                      >
                        {isPasskeyPending ? 'Authenticating' : 'Continue with Passkey'}
                      </Button>
                      {lastLoginMethod === 'passkey' && <LastUsedBadge variant='secondary' />}
                    </div>
                  )}
                </div>
                <p className='mt-3 text-center text-sm'>
                  Need to create an account?&nbsp;
                  <Link className='text-link text-sm' href={routes.signUp}>
                    Sign Up
                  </Link>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </div>
  );
}
