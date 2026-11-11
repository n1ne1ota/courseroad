'use client';

import { useSyncExternalStore } from 'react';

import type { Route } from 'next';
import Link from 'next/link';

import { getAuthPath } from '@/lib/utils/auth-navigation';

import { Button, Spinner } from '@courseroad/iota-ui';

import type { UserDropdownData } from '@/types/user.types';

import { AccountDropdown } from './account-dropdown';

interface AuthButtonProps {
  isPending: boolean;
  user?: UserDropdownData | null;
  variant?: 'desktop' | 'mobile';
}

/**
 * Reusable authentication buttons component
 * Shows sign in/sign up buttons when logged out, or user dropdown when logged in
 */
export function AuthButton({ isPending, user, variant = 'desktop' }: AuthButtonProps) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  if (!mounted || isPending) {
    if (variant === 'mobile') {
      return (
        <>
          <Button
            className='flex-1'
            disabled
            isLoading
            radius='full'
            size='sm'
            spinner={<Spinner color='current' size='sm' />}
            variant='flat'
          />
          <Button
            className='flex-1'
            disabled
            isLoading
            color='primary'
            radius='full'
            size='sm'
            spinner={<Spinner color='current' size='sm' />}
          />
        </>
      );
    }

    return (
      <div className='flex items-center gap-2'>
        <Button disabled color='secondary' radius='full' size='sm' variant='solid'>
          Sign In
        </Button>
        <Button disabled color='primary' radius='full' size='sm'>
          Sign Up
        </Button>
      </div>
    );
  }

  if (user) return <AccountDropdown user={user} />;

  if (variant === 'mobile') {
    return (
      <>
        <Button
          className='flex-1'
          as={Link}
          color='secondary'
          href={getAuthPath('signIn') as Route}
          radius='full'
          size='sm'
          variant='solid'
        >
          Sign In
        </Button>
        <Button
          className='flex-1'
          as={Link}
          color='primary'
          href={getAuthPath('signUp') as Route}
          radius='full'
          size='sm'
        >
          Sign Up
        </Button>
      </>
    );
  }

  return (
    <div className='flex items-center gap-2'>
      <Button as={Link} color='secondary' href={getAuthPath('signIn') as Route} radius='full' size='sm' variant='solid'>
        Sign In
      </Button>
      <Button as={Link} color='primary' href={getAuthPath('signUp') as Route} radius='full' size='sm'>
        Sign Up
      </Button>
    </div>
  );
}
