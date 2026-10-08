import { Suspense } from 'react';

import type { Metadata } from 'next';

import { ForgotPasswordForm } from '@/features/auth/components/forgot-password-form';
import { ForgotPasswordSkeleton } from '@/features/auth/components/forgot-password-skeleton';

export default function ResetPasswordPage() {
  return (
    <div className='flex flex-1 items-center justify-center p-4'>
      <Suspense fallback={<ForgotPasswordSkeleton />}>
        <ForgotPasswordForm />
      </Suspense>
    </div>
  );
}

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: 'Reset Password'
};
