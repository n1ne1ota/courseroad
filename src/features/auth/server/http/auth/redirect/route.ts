import 'server-only';

import type { Route } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { protectedRoutes } from '@/lib/routes';

import { auth } from '@/server/auth/auth';
import { prismaClient } from '@/server/db/client';

/**
 * Post-authentication redirect handler.
 *
 * Routing decision tree:
 *  - callbackUrl present & valid -> callbackUrl (invite link bypass)
 *  - Platform roles (admin, staff) -> respective dashboards
 *  - 0 memberships -> /onboarding (onboarding wizard inside auth layout)
 *  - 1 membership  -> /organization/[slug]/dashboard (auto-enter)
 *  - 2+ memberships -> /organization/select (org picker)
 */
export async function GET(request: Request) {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) redirect('/sign-in' as Route);

    // Invite link bypass: callbackUrl takes priority when present and safe
    const { searchParams } = new URL(request.url);
    const callbackUrl = searchParams.get('callbackUrl');

    if (callbackUrl && (callbackUrl.startsWith('/organization/') || callbackUrl.startsWith('/api/auth/'))) {
        redirect(callbackUrl as Route);
    }

    const role = session.user.role;

    // Platform-level roles: keep existing admin/staff/creator dashboards
    if (role === 'admin') redirect(protectedRoutes.adminDashboard as Route);
    if (role === 'staff') redirect(protectedRoutes.staffDashboard as Route);
    if (role === 'creator') redirect(protectedRoutes.creatorDashboard as Route);

    // Org-scoped roles: resolve memberships
    const memberships = await prismaClient.member.findMany({
        include: {
            organization: {
                select: { slug: true }
            }
        },
        where: { userId: session.user.id }
    });

    // Check if user has completed onboarding
    const onboardingComplete = (session.user as { onboardingComplete?: boolean }).onboardingComplete;

    if (!onboardingComplete) {
        redirect('/onboarding' as Route);
    }

    // Zero orgs & onboarding complete: redirect to B2C learner dashboard
    if (memberships.length === 0) {
        redirect(protectedRoutes.dashboard as Route);
    }

    // Single org: auto-enter B2B dashboard based on role
    if (memberships.length === 1 && memberships[0]) {
        const orgSlug = memberships[0].organization.slug;
        const role = memberships[0].role.toLowerCase();
        const roles = ['owner', 'manager', 'creator', 'instructor', 'learner'];
        const activeRole = roles.includes(role) ? role : 'learner';

        redirect(`/organization/${orgSlug}/${activeRole}/dashboard` as Route);
    }

    // Multiple orgs: selector page
    redirect('/select-organization' as Route);
}
