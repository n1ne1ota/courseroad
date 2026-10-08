import 'server-only';

import type { Route } from 'next';

import { destination } from '@/server/auth/read-errors';
import { getSession } from '@/server/auth/session';
import { prismaClient } from '@/server/db/client';

/** Authorized organization projection for SelectOrganizationPage. */
export async function loadSelectOrganizationPage() {
    const session = await getSession();
    if (!session?.user) destination('/sign-in' as Route);
    const memberships = await prismaClient.member.findMany({
        include: {
            organization: {
                select: {
                    id: true,
                    logo: true,
                    name: true,
                    plan: true,
                    slug: true
                }
            }
        },
        where: { userId: session.user.id }
    });
    if (memberships.length === 0) {
        const role = session.user.role;
        if (role === 'admin') destination('/admin/dashboard' as Route);
        if (role === 'staff') destination('/staff/dashboard' as Route);
        if (role === 'creator') destination('/creator/dashboard' as Route);
        destination('/learner/dashboard' as Route);
    }
    if (memberships.length === 1 && memberships[0]) {
        destination(`/organization/${memberships[0].organization.slug}` as Route);
    }
    return { memberships };
}
