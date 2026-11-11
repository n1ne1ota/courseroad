import { Suspense } from 'react';

import type { Metadata } from 'next';

import { SignInForm } from '@/features/auth/components/sign-in-form';
import { SignInSkeleton } from '@/features/auth/components/sign-in-skeleton';

export default function SignInPage() {
  return (
    <div className='flex flex-1 items-center justify-center p-4'>
      <Suspense fallback={<SignInSkeleton />}>
        <SignInForm />
      </Suspense>
    </div>
  );
}

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: 'Login'
};
