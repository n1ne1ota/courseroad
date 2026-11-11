import 'server-only';

import type { JSX } from 'react';

import { MembersPage } from '@/features/organization/members-page';
import { loadMembersView } from '@/features/organization/server/loaders/organization-members-view';
import { readForPage } from '@/server/auth/page-access';

type MembersViewProps = {
  orgSlug: string;
};

export async function MembersView({ orgSlug }: MembersViewProps): Promise<JSX.Element> {
  const { session, fullOrg, role, members, invitations } = await readForPage(() => loadMembersView({ orgSlug }));

  return (
    <div className='px-4 py-8 lg:px-6'>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold tracking-tight'>Members</h1>
        <p className='mt-1 text-muted-foreground'>Manage who has access to this organization.</p>
      </div>
      <MembersPage
        currentUserId={session.user.id}
        initialInvitations={invitations}
        initialMembers={members}
        organizationId={fullOrg.id}
        userRole={role}
      />
    </div>
  );
}
