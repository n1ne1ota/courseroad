import type { JSX } from 'react';

import { loadCreatorDashboardProfilePage } from '@/features/auth/server/loaders/platform-creator-profile';
import { CreatorProfileEditor } from '@/features/dashboard/platform/creator/creator-profile-editor';
import { DashboardPlatformLayout } from '@/features/dashboard/shared/shell/dashboard-platform-layout';
import { readForPage } from '@/server/auth/page-access';

export default async function CreatorDashboardProfilePage(): Promise<JSX.Element> {
  const { user } = await readForPage(() => loadCreatorDashboardProfilePage());

  return (
    <DashboardPlatformLayout role='creator' title='Public Profile Settings'>
      <div className='flex flex-col gap-6'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight text-foreground'>Public Profile Settings</h2>
          <p className='text-sm text-muted-foreground'>
            Customize your public biography and social profiles visible to learners.
          </p>
        </div>

        <CreatorProfileEditor initialProfile={user} />
      </div>
    </DashboardPlatformLayout>
  );
}
