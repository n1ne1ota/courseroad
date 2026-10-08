import { Suspense } from 'react';

import type { Metadata } from 'next';

import { SignUpForm } from '@/features/auth/components/sign-up-form';
import { SignUpSkeleton } from '@/features/auth/components/sign-up-skeleton';

export default function SignUpPage() {
  return (
    <div className='flex flex-1 items-center justify-center p-4'>
      <Suspense fallback={<SignUpSkeleton />}>
        <SignUpForm />
      </Suspense>
    </div>
  );
}

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: 'Sign Up'
};
