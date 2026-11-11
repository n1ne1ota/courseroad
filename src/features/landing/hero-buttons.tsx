'use client';

import { useSyncExternalStore } from 'react';

import Link from 'next/link';

import { useSession } from '@/lib/auth/auth-client';
import { getDashboardPath, type UserRole } from '@/lib/utils/auth-navigation';

import { Button } from '@courseroad/iota-ui';

import { HeroButton } from './hero-button';

/**
 * User action buttons for the landing page
 * Shows different buttons based on user role:
 * - ADMIN/STAFF: Dashboard button
 * - CREATOR: Dashboard button
 * - LEARNER: Account button
 * - Unauthenticated: Sign In/Sign Up buttons
 */
export function HeroButtons() {
  const { data: session, isPending } = useSession();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // Don't render anything while checking auth state or during SSR
  if (!mounted || isPending) {
    return (
      <div className='mt-2 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row'>
        <Button className='w-full sm:w-auto' disabled color='secondary' radius='full' size='lg' variant='solid'>
          Sign In
        </Button>
        <Button className='w-full sm:w-auto' disabled color='primary' radius='full' size='lg'>
          Sign Up
        </Button>
      </div>
    );
  }

  // If user is logged in, show role-based button
  if (session?.user) {
    const userWithRole = session.user as { role?: string };
    const role = (userWithRole.role as UserRole) || 'learner';
    const dashboardPath = getDashboardPath(role);

    // Determine button label based on role
    const isLearner = role === 'learner';

    return (
      <div className='mt-2 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row'>
        <HeroButton href={dashboardPath}>{isLearner ? 'My Account' : 'Dashboard'}</HeroButton>
      </div>
    );
  }

  // If user is not logged in, show auth buttons
  return (
    <div className='mt-2 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row'>
      <Button
        className='w-full font-medium sm:w-auto'
        color='secondary'
        radius='full'
        render={<Link href='/sign-in' />}
        size='lg'
        variant='solid'
      >
        Sign In
      </Button>
      <HeroButton href='/sign-up'>Sign Up</HeroButton>
    </div>
  );
}
