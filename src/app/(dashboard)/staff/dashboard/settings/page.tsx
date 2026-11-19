import type { Metadata } from 'next';

import { AccountSecuritySection } from '@/features/auth/components/account-security-section';

export const metadata: Metadata = {
  description: 'Manage staff settings',
  title: 'Staff Settings'
};

export default function StaffSettingsPage() {
  return (
    <>
      <div className='flex max-w-4xl flex-col gap-6'>
        <div>
          <h1 className='text-2xl font-bold'>Staff Settings</h1>
          <p className='mt-2 text-muted-foreground'>This page will contain staff configuration options.</p>
        </div>

        <section className='space-y-4'>
          <h2 className='text-lg font-semibold'>Security</h2>
          <AccountSecuritySection />
        </section>
      </div>
    </>
  );
}
