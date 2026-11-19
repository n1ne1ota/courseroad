import type { JSX } from 'react';

import { loadCreatorDashboardProfilePage } from '@/features/auth/server/loaders/platform-creator-profile';
import { CreatorProfileEditor } from '@/features/dashboard/platform/creator/creator-profile-editor';
import { readForPage } from '@/server/auth/page-access';

export default async function CreatorDashboardProfilePage(): Promise<JSX.Element> {
  const { user } = await readForPage(() => loadCreatorDashboardProfilePage());

  return (
    <>
      <div>
        <h2 className='text-2xl font-bold tracking-tight text-foreground'>Public Profile Settings</h2>
        <p className='text-sm text-muted-foreground'>
          Customize your public biography and social profiles visible to learners.
        </p>
      </div>

      <CreatorProfileEditor initialProfile={user} />
    </>
  );
}
