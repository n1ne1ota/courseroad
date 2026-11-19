import 'server-only';

import type { JSX } from 'react';
import { Suspense } from 'react';

import { DashboardPageShell } from '@/features/dashboard/shared/ui/dashboard-page-shell';
import { MembersPage } from '@/features/organization/components/members-page';
import { MembersPageSkeleton } from '@/features/organization/components/members-page-skeleton';
import { loadMembersView } from '@/features/organization/server/loaders/organization-members-view';
import { readForPage } from '@/server/auth/page-access';

type MembersViewProps = {
  orgSlug: string;
};

async function MembersContent({ orgSlug }: MembersViewProps): Promise<JSX.Element> {
  const { session, fullOrg, role, members, invitations } = await readForPage(() => loadMembersView({ orgSlug }));

  return (
    <MembersPage
      currentUserId={session.user.id}
      initialInvitations={invitations}
      initialMembers={members}
      organizationId={fullOrg.id}
      userRole={role}
    />
  );
}

/** Static heading streams first; the member table suspends on its own skeleton. */
export function MembersView({ orgSlug }: MembersViewProps): JSX.Element {
  return (
    <DashboardPageShell description='Manage who has access to this organization.' title='Members'>
      <Suspense fallback={<MembersPageSkeleton />}>
        <MembersContent orgSlug={orgSlug} />
      </Suspense>
    </DashboardPageShell>
  );
}
