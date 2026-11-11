import type { Metadata } from 'next';

import { AccountSecuritySection } from '@/features/auth/components/account-security-section';
import { DashboardPlatformLayout } from '@/features/dashboard/shared/shell/dashboard-platform-layout';

export const metadata: Metadata = {
  description: 'Manage staff settings',
  title: 'Staff Settings'
};

export default function StaffSettingsPage() {
  return (
    <DashboardPlatformLayout role='staff' title='Settings'>
      <div className='flex max-w-4xl flex-col gap-8 p-4'>
        <div>
          <h1 className='text-2xl font-bold'>Staff Settings</h1>
          <p className='mt-2 text-muted-foreground'>This page will contain staff configuration options.</p>
        </div>

        <section className='space-y-4'>
          <h2 className='text-lg font-semibold'>Security</h2>
          <AccountSecuritySection />
        </section>
      </div>
    </DashboardPlatformLayout>
  );
}
