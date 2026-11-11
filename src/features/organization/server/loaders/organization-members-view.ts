import 'server-only';

import type { Route } from 'next';
import { headers } from 'next/headers';

import { auth } from '@/server/auth/auth';
import { getOrganizationContext } from '@/server/auth/organization-context';
import { destination, missingResource } from '@/server/auth/read-errors';
import { getSession } from '@/server/auth/session';

type MembersViewProps = {
    orgSlug: string;
};
/** Authorized organization projection for MembersView. */
export async function loadMembersView({ orgSlug }: MembersViewProps) {
    await getOrganizationContext(orgSlug, 'manager');
    const reqHeaders = await headers();
    const session = await getSession();
    if (!session?.user) destination('/sign-in' as Route);
    const fullOrg = await auth.api.getFullOrganization({
        headers: reqHeaders,
        query: { organizationSlug: orgSlug }
    });
    if (!fullOrg) missingResource();
    const { member } = await getOrganizationContext(orgSlug);
    const role = ((member?.role as string) ?? 'learner').toLowerCase();
    if (role !== 'owner' && role !== 'manager') missingResource();
    const members = (fullOrg.members ?? []).map((m: Record<string, unknown>) => ({
        createdAt: String(m.createdAt ?? ''),
        email: String((m.user as Record<string, unknown>)?.email ?? ''),
        id: String(m.id),
        image: ((m.user as Record<string, unknown>)?.image as string) ?? null,
        name: String((m.user as Record<string, unknown>)?.name ?? ''),
        role: String(m.role ?? 'member'),
        userId: String(m.userId)
    }));
    const invitations = (fullOrg.invitations ?? []).map((inv: Record<string, unknown>) => ({
        email: String(inv.email ?? ''),
        expiresAt: String(inv.expiresAt ?? ''),
        id: String(inv.id),
        role: inv.role ? String(inv.role) : null,
        status: String(inv.status ?? 'pending')
    }));
    return { session, fullOrg, role, members, invitations };
}
