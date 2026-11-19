import { Suspense } from 'react';

import type { Metadata } from 'next';

import { AcceptInvitation } from '@/features/organization/components/accept-invitation';
import { AcceptInvitationSkeleton } from '@/features/organization/components/accept-invitation-skeleton';
import { loadInvitationEntry } from '@/features/organization/server/invitations';

export const metadata: Metadata = { title: 'Organization invitation', robots: { index: false, follow: false } };
type Props = { params: Promise<{ invitationId: string }> };

/** Standalone entry outside membership and organization-creation guards. */
export default function InvitationPage({ params }: Props) {
  return (
    <Suspense fallback={<AcceptInvitationSkeleton />}>
      <InvitationContent params={params} />
    </Suspense>
  );
}

async function InvitationContent({ params }: Props) {
  const { invitationId } = await params;
  return <AcceptInvitation entry={await loadInvitationEntry(invitationId)} invitationId={invitationId} />;
}
