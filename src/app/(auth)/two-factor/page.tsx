import { Suspense } from 'react';

import type { Metadata } from 'next';

import { OtpSkeleton } from '@/features/auth/components/otp-skeleton';
import { TwoFactorForm } from '@/features/auth/components/two-factor-form';

export default function TwoFactorPage() {
  return (
    <div className='flex flex-1 items-center justify-center p-4'>
      <Suspense fallback={<OtpSkeleton />}>
        <TwoFactorForm />
      </Suspense>
    </div>
  );
}

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: 'Two-Factor Authentication'
};
