import type { JSX } from 'react';

import type { Route } from 'next';
import Link from 'next/link';

import { Button } from '@courseroad/iota-ui';

import { AccountSecuritySection } from '@/features/auth/components/account-security-section';
import { DashboardPlatformLayout } from '@/features/dashboard/shared/shell/dashboard-platform-layout';
import { requireRole } from '@/server/auth/require-role';

export default async function CreatorDashboardSettingsPage(): Promise<JSX.Element> {
  const user = await requireRole('CREATOR');

  return (
    <DashboardPlatformLayout role='creator' title='Instructor Settings'>
      <div className='flex max-w-4xl flex-col gap-6'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight text-foreground'>Instructor Settings</h2>
          <p className='text-sm text-muted-foreground'>
            Manage your instructor account status, preferences, and details.
          </p>
        </div>

        <div className='border-default-200/50 flex flex-col gap-6 rounded-3xl border bg-background/40 p-8 shadow-sm backdrop-blur-md'>
          <h3 className='border-default-200/50 border-b pb-3 text-lg font-bold text-foreground'>Account Info</h3>

          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            <div>
              <p className='text-sm font-semibold text-muted-foreground'>Email Address</p>
              <p className='mt-1 text-base font-medium text-foreground'>{user.email}</p>
            </div>
            <div>
              <p className='text-sm font-semibold text-muted-foreground'>Instructor Username</p>
              <p className='mt-1 text-base font-medium text-foreground'>@{user.username || 'not-configured'}</p>
            </div>
            <div>
              <p className='text-sm font-semibold text-muted-foreground'>Account Type</p>
              <div className='mt-1.5'>
                <span className='inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary uppercase'>
                  B2C Creator
                </span>
              </div>
            </div>
            <div>
              <p className='text-sm font-semibold text-muted-foreground'>Public Profile URL</p>
              <p className='mt-1 cursor-pointer text-base font-medium text-primary hover:underline'>
                /creators/{user.username || user.id}
              </p>
            </div>
          </div>
        </div>

        <div className='border-default-200/50 flex flex-col gap-6 rounded-3xl border bg-background/40 p-8 shadow-sm backdrop-blur-md'>
          <h3 className='border-default-200/50 border-b pb-3 text-lg font-bold text-foreground'>Preferences</h3>

          <div className='flex flex-col gap-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-semibold text-foreground'>Email Notifications</p>
                <p className='text-xs text-muted-foreground'>
                  Receive weekly summaries of course sales and enrollment updates.
                </p>
              </div>
              <input
                className='border-default-200 size-4 rounded text-primary focus:ring-primary'
                type='checkbox'
                defaultChecked
              />
            </div>

            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm font-semibold text-foreground'>Learner Q&A Notifications</p>
                <p className='text-xs text-muted-foreground'>
                  Get notified when learners ask questions in your authored courses.
                </p>
              </div>
              <input
                className='border-default-200 size-4 rounded text-primary focus:ring-primary'
                type='checkbox'
                defaultChecked
              />
            </div>
          </div>
        </div>

        <div className='border-default-200/50 flex flex-col gap-6 rounded-3xl border bg-background/40 p-8 shadow-sm backdrop-blur-md'>
          <h3 className='border-default-200/50 border-b pb-3 text-lg font-bold text-foreground'>Security</h3>
          <AccountSecuritySection />
        </div>

        <div className='flex justify-end gap-4'>
          <Link href={'/creator/dashboard/profile' as Route}>
            <Button className='rounded-xl' color='primary'>
              Edit Profile
            </Button>
          </Link>
        </div>
      </div>
    </DashboardPlatformLayout>
  );
}
