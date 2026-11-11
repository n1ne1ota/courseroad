import { Suspense } from 'react';

import type { Metadata } from 'next';

import { OtpForm } from '@/features/auth/components/otp-form';
import { OtpSkeleton } from '@/features/auth/components/otp-skeleton';

export default function OtpPage() {
  return (
    <div className='flex flex-1 items-center justify-center p-4'>
      <Suspense fallback={<OtpSkeleton />}>
        <OtpForm />
      </Suspense>
    </div>
  );
}

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: 'Verify Email'
};
