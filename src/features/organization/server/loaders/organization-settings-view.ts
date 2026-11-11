import 'server-only';

import { headers } from 'next/headers';

import { createOrgRoutes } from '@/lib/routes/org';

import { auth } from '@/server/auth/auth';
import { getOrganizationContext } from '@/server/auth/organization-context';
import { missingResource } from '@/server/auth/read-errors';

type SettingsViewProps = {
    orgSlug: string;
};
/** Authorized organization projection for SettingsView. */
export async function loadSettingsView({ orgSlug }: SettingsViewProps) {
    await getOrganizationContext(orgSlug, 'manager');
    const reqHeaders = await headers();
    const fullOrg = await auth.api.getFullOrganization({
        headers: reqHeaders,
        query: { organizationSlug: orgSlug }
    });
    if (!fullOrg) missingResource();
    const { member } = await getOrganizationContext(orgSlug);
    const role = ((member?.role as string) ?? 'learner').toLowerCase();
    const orgRoutes = createOrgRoutes(orgSlug, role);
    return { fullOrg, role, orgRoutes };
}
