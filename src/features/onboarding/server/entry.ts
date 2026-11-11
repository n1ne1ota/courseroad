import 'server-only';

import type { Route } from 'next';

import { destination } from '@/server/auth/read-errors';
import { getSession } from '@/server/auth/session';
import { prismaClient } from '@/server/db/client';

/**
 * Server-side guard for all onboarding pages.
 * Ensures the user is logged in, and checks if they should be redirected
 * to their dashboard based on memberships and onboarding status.
 *
 * @returns The authenticated session user.
 */
export async function getOnboardingEntry() {
    const session = await getSession();

    if (!session?.user) destination('/sign-in' as Route);

    const onboardingComplete = (session.user as { onboardingComplete?: boolean }).onboardingComplete;

    const memberships = await prismaClient.member.findMany({
        select: { id: true },
        where: { userId: session.user.id }
    });

    // If onboarding is complete and they have no organization memberships, they are B2C users.
    // Route them to their B2C dashboard.
    if (onboardingComplete && memberships.length === 0) {
        const role = session.user.role;

        if (role === 'creator') destination('/creator/dashboard' as Route);

        destination('/learner/dashboard' as Route);
    }

    // If they have exactly 1 organization membership, auto-route to that organization.
    if (memberships.length === 1) {
        const membership = await prismaClient.member.findFirst({
            include: { organization: { select: { slug: true } } },
            where: { userId: session.user.id }
        });

        if (membership) destination(`/organization/${membership.organization.slug}` as Route);
    }

    // If they have multiple organizations, route to the select-organization list.
    if (memberships.length > 1) destination('/select-organization' as Route);

    return session.user;
}
