import 'server-only';

import { getOrganizationContext } from '@/server/auth/organization-context';
import { prismaClient } from '@/server/db/client';
import { withTenantScope } from '@/server/db/tenant';

import type { OrgRoleLevel } from '@/server/auth/organization-context';

/** Tenant repositories receive a client only after independent membership verification. */
export async function getTenantPrisma(slug?: string, role: OrgRoleLevel = 'learner') {
    const context = await getOrganizationContext(slug, role);
    return withTenantScope(prismaClient, context.organizationId) as unknown as typeof prismaClient;
}
