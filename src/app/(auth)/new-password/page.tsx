import { Suspense } from 'react';

import type { Metadata } from 'next';

import { NewPasswordForm } from '@/features/auth/components/new-password-form';
import { NewPasswordSkeleton } from '@/features/auth/components/new-password-skeleton';

export default function NewPasswordPage() {
  return (
    <div className='flex flex-1 items-center justify-center p-4'>
      <Suspense fallback={<NewPasswordSkeleton />}>
        <NewPasswordForm />
      </Suspense>
    </div>
  );
}

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: 'Set New Password'
};
