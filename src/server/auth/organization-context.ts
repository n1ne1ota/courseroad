import 'server-only';

import { cache } from 'react';

import { headers } from 'next/headers';

import { z } from 'zod';

import { meetsOrganizationRole, type OrgRoleLevel } from '@/lib/auth/org-role-levels';

import { AccessError, getAuthenticatedUser } from '@/server/auth/session';
import { prismaClient } from '@/server/db/client';

export { meetsOrganizationRole, organizationRoles, type OrgRoleLevel } from '@/lib/auth/org-role-levels';

const resolveOrganization = cache(async (slug: string) => {
    const user = await getAuthenticatedUser();
    const organization = await prismaClient.organization.findUnique({
        where: { slug },
        select: {
            id: true,
            slug: true,
            name: true,
            logo: true,
            metadata: true,
            primaryColor: true,
            secondaryColor: true,
            platformFeePercent: true,
            stripeAccountId: true,
            stripeOnboardingComplete: true
        }
    });
    if (!organization) throw new AccessError('Organization not found', 404);
    const member = await prismaClient.member.findUnique({
        where: { userId_organizationId: { userId: user.id, organizationId: organization.id } },
        select: { id: true, role: true, userId: true, organizationId: true }
    });
    if (!member) throw new AccessError('Organization not found', 404);
    return { user, member, organization, organizationId: organization.id, organizationSlug: organization.slug };
});

/** Resolve the URL organization, never the session's mutable active preference. */
export async function getOrganizationContext(slug?: string, role: OrgRoleLevel = 'learner') {
    const input = slug ?? (await headers()).get('x-organization-slug');
    const parsed = z
        .string()
        .min(1)
        .max(255)
        .regex(/^[a-zA-Z0-9_-]+$/)
        .safeParse(input);
    if (!parsed.success) throw new AccessError('Organization context required', 404);
    const context = await resolveOrganization(parsed.data);
    if (!meetsOrganizationRole(context.member.role, role)) throw new AccessError('Forbidden');
    return context;
}
