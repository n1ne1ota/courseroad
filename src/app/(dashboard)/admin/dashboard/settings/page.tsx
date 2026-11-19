import type { Metadata } from 'next';

import { AccountSecuritySection } from '@/features/auth/components/account-security-section';

export const metadata: Metadata = {
  description: 'Manage platform settings',
  title: 'Admin Settings'
};

export default function AdminSettingsPage() {
  return (
    <>
      <div className='flex max-w-4xl flex-col gap-6'>
        <div>
          <h1 className='text-2xl font-bold'>Admin Settings</h1>
          <p className='mt-2 text-muted-foreground'>This page will contain platform configuration options.</p>
        </div>

        <section className='space-y-4'>
          <h2 className='text-lg font-semibold'>Security</h2>
          <AccountSecuritySection />
        </section>
      </div>
    </>
  );
}
