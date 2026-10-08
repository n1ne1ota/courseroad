'use client';

import { useState, useTransition } from 'react';

import type { Route } from 'next';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { Button, Card, Checkbox, Input, Spinner } from '@courseroad/iota-ui';
import { Alert, AlertDescription } from '@courseroad/kurume-ui';
import { Letter as LetterIcon } from '@solar-icons/react-perf/Bold';
import { AltArrowLeft as ArrowLeftIcon } from '@solar-icons/react-perf/Linear';
import { AnimatePresence, motion } from 'motion/react';

import { signInWithGitHub, signInWithGoogle, signUpWithEmail } from '@/lib/auth/auth-client';
import { getCallbackUrl } from '@/lib/auth/callback-url';
import { routes } from '@/lib/routes';

import { GitHubIcon } from '@/assets/icons/github-icon';
import { GoogleColorIcon as GoogleIcon } from '@/assets/icons/google-icon';

import { HomeButton } from './home-button';

export function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showEmailForm, setShowEmailForm] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [isEmailPending, startEmailTransition] = useTransition();
  const [isGooglePending, startGoogleTransition] = useTransition();
  const [isGitHubPending, startGitHubTransition] = useTransition();

  const callbackUrl = getCallbackUrl(searchParams, '/api/auth/redirect');

  const handleEmailAction = (formData: FormData) => {
    const firstName = String(formData.get('firstName') || '').trim();
    const lastName = String(formData.get('lastName') || '').trim();
    const username = String(formData.get('username') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const password = String(formData.get('password') || '');
    const confirmPassword = String(formData.get('confirmPassword') || '');

    setError(null);
    startEmailTransition(async () => {
      const result = await signUpWithEmail(firstName, lastName, username, email, password, confirmPassword);

      if (!result.success) {
        setError(result.error?.message || 'An error occurred. Please try again.');
        return;
      }
      router.push(routes.otp as Route);
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
          <h1 className='mb-4 text-center text-2xl font-extrabold tracking-tight'>Sign Up</h1>

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
                <form className='flex flex-col gap-3' action={handleEmailAction}>
                  <Input name='firstName' type='text' autoFocus isRequired label='First Name' />
                  <Input name='lastName' type='text' isRequired label='Last Name' />
                  <Input name='username' type='text' isRequired label='Username' />
                  <Input name='email' type='email' isRequired label='Email Address' />
                  <Input name='password' type='password' isRequired autoComplete='new-password' label='Password' />
                  <Input
                    name='confirmPassword'
                    type='password'
                    isRequired
                    autoComplete='new-password'
                    label='Confirm Password'
                  />
                  <div className='flex py-2'>
                    <Checkbox name='terms' required size='sm' />
                    <p className='text-sm'>
                      I agree with the&nbsp;
                      <Link className='text-link text-sm' href={routes.terms}>
                        Terms
                      </Link>
                      <span>&nbsp;</span>
                      and
                      <span>&nbsp;</span>
                      <Link className='text-link text-sm' href={routes.privacyPolicy}>
                        Privacy Policy
                      </Link>
                    </p>
                  </div>
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
                      {isEmailPending ? 'Signing Up' : 'Sign Up'}
                    </Button>
                  </div>
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
                <Button
                  type='button'
                  fullWidth
                  color='primary'
                  startContent={<LetterIcon className='pointer-events-none' size={20} />}
                  onPress={() => setShowEmailForm(true)}
                >
                  Continue with Email
                </Button>
                <div className='flex items-center gap-4 py-2'>
                  <hr className='flex-1 border-t border-border' />
                  <p className='shrink-0 text-xs text-muted-foreground'>OR</p>
                  <hr className='flex-1 border-t border-border' />
                </div>
                <div className='flex flex-col gap-2'>
                  <Button
                    fullWidth
                    color='secondary'
                    isLoading={isGooglePending}
                    spinner={<Spinner color='current' size='sm' />}
                    startContent={!isGooglePending && <GoogleIcon height={24} width={24} />}
                    onPress={handleGoogleSignIn}
                  >
                    {isGooglePending ? 'Signing Up' : 'Continue with Google'}
                  </Button>
                  <Button
                    fullWidth
                    color='secondary'
                    isLoading={isGitHubPending}
                    spinner={<Spinner color='current' size='sm' />}
                    startContent={!isGitHubPending && <GitHubIcon height={24} width={24} />}
                    onPress={handleGitHubSignIn}
                  >
                    {isGitHubPending ? 'Signing Up' : 'Continue with GitHub'}
                  </Button>
                </div>
                <p className='mt-3 text-center text-sm'>
                  Already have an account?&nbsp;
                  <Link className='text-link text-sm' href={routes.signIn}>
                    Sign In
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
