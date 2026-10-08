'use client';

import { useSyncExternalStore } from 'react';

import type { Route } from 'next';
import { useRouter } from 'next/navigation';

import { useSession } from '@/lib/auth/auth-client';
import { getAuthPath } from '@/lib/utils/auth-navigation';

import { Button } from '@courseroad/iota-ui';

/**
 * Auth buttons for the landing page
 * Shows Sign In/Sign Up buttons when logged out, or nothing when logged in
 * (logged in users will be redirected to their dashboard)
 */
export function AuthButtons() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // Don't render anything while checking auth state or during SSR
  if (!mounted || isPending) {
    return (
      <div className='mt-4 flex items-center gap-3'>
        <Button disabled radius='sm' variant='flat'>
          Sign In
        </Button>
        <Button disabled color='primary' radius='sm'>
          Sign Up
        </Button>
      </div>
    );
  }

  // If user is logged in, don't show auth buttons
  // They will be redirected to their dashboard based on role
  if (session?.user) {
    return null;
  }

  return (
    <div className='mt-4 flex items-center gap-3'>
      <Button
        color='secondary'
        radius='sm'
        variant='solid'
        onPress={() => {
          router.push(getAuthPath('signIn') as Route);
        }}
      >
        Sign In
      </Button>
      <Button
        color='primary'
        radius='sm'
        variant='solid'
        onPress={() => {
          router.push(getAuthPath('signUp') as Route);
        }}
      >
        Sign Up
      </Button>
    </div>
  );
}
