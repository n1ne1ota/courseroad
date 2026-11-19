import 'server-only';

import { headers } from 'next/headers';

import { isOrganizationMemberRole } from '@/lib/auth/org-role-policy';
import { createOrgRoutes } from '@/lib/routes/org';

import { acceptInvitationSchema, invitationIdSchema } from '@/features/organization/invitation-contract';
import { auth } from '@/server/auth/auth';
import { AccessError } from '@/server/auth/session';
import { prismaClient } from '@/server/db/client';

import type { InvitationEntry } from '@/features/organization/invitation-contract';

/** Resolve recipient access independently of organization layouts and active preferences. */
async function recipientContext(invitationId: unknown) {
    const parsed = invitationIdSchema.safeParse(invitationId);
    if (!parsed.success) return { status: 'unknown' } as const;
    const requestHeaders = await headers();
    const session = await auth.api.getSession({ headers: requestHeaders, query: { disableCookieCache: true } });
    if (!session?.user) return { status: 'signed-out' } as const;
    if (!session.user.emailVerified) return { status: 'unverified' } as const;
    const invitation = await prismaClient.invitation.findUnique({
        where: { id: parsed.data },
        select: { id: true, email: true, organizationId: true, role: true, status: true, expiresAt: true }
    });
    if (!invitation) return { status: 'unknown' } as const;
    if (invitation.email.toLowerCase() !== session.user.email.toLowerCase())
        return { status: 'wrong-account' } as const;
    if (invitation.status === 'canceled' || invitation.status === 'rejected') return { status: 'cancelled' } as const;
    if (invitation.status !== 'pending' && invitation.status !== 'accepted') return { status: 'unavailable' } as const;
    if (!isOrganizationMemberRole(invitation.role)) return { status: 'unavailable' } as const;
    // A completed invitation remains a recovery reference after its original expiry.
    if (invitation.status === 'pending' && invitation.expiresAt.getTime() <= Date.now())
        return { status: 'expired' } as const;
    return { status: 'authorized', invitation, session, requestHeaders } as const;
}

/** Recover only the recipient's membership in the invitation's server-owned organization. */
async function acceptedMembership(organizationId: string, userId: string) {
    const member = await prismaClient.member.findFirst({
        where: { organizationId, userId },
        select: { role: true, organization: { select: { name: true, slug: true } } }
    });
    if (!member || (member.role !== 'owner' && !isOrganizationMemberRole(member.role))) {
        throw new AccessError(
            'Your membership is not available yet. Retry, or ask the organization owner for a new invitation.'
        );
    }
    return member;
}

/** Read-only entry: rendering never accepts, activates, or completes onboarding. */
export async function loadInvitationEntry(invitationId: unknown): Promise<InvitationEntry> {
    const context = await recipientContext(invitationId);
    if (context.status !== 'authorized') return context;
    const { invitation, session, requestHeaders } = context;
    if (invitation.status === 'accepted') {
        try {
            const member = await acceptedMembership(invitation.organizationId, session.user.id);
            return {
                status: 'accepted',
                organizationName: member.organization.name,
                role: member.role,
                expiresAt: invitation.expiresAt.toISOString()
            };
        } catch (error) {
            if (error instanceof AccessError) return { status: 'unavailable' };
            throw error;
        }
    }
    try {
        const details = await auth.api.getInvitation({ headers: requestHeaders, query: { id: invitation.id } });
        return {
            status: 'pending',
            organizationName: details.organizationName,
            role: details.role,
            expiresAt: new Date(details.expiresAt).toISOString(),
            inviterEmail: details.inviterEmail
        };
    } catch {
        return { status: 'unavailable' };
    }
}

/** Explicit acceptance with idempotent recovery after completion or activation failure. */
export async function acceptOrganizationInvitation(input: unknown) {
    const { invitationId } = acceptInvitationSchema.parse(input);
    let context = await recipientContext(invitationId);
    if (context.status !== 'authorized')
        throw new AccessError('This invitation cannot be accepted with the current account.');
    if (context.invitation.status === 'pending') {
        try {
            await auth.api.acceptInvitation({ headers: context.requestHeaders, body: { invitationId } });
        } catch {
            // Native acceptance uses a pending-to-accepted compare-and-set. A racing
            // request may finish first; only its verified resulting membership recovers.
            context = await recipientContext(invitationId);
            if (context.status !== 'authorized' || context.invitation.status !== 'accepted') {
                throw new AccessError('The invitation could not be accepted. Refresh and try again.');
            }
        }
    }
    context = await recipientContext(invitationId);
    if (context.status !== 'authorized' || context.invitation.status !== 'accepted')
        throw new AccessError('Invitation acceptance is not complete.');
    const { invitation, session, requestHeaders } = context;
    await acceptedMembership(invitation.organizationId, session.user.id);
    // Better Auth independently authorizes this account update; no onboarding
    // feature dependency or platform-role assignment is needed.
    if (!session.user.onboardingComplete)
        await auth.api.updateUser({ headers: requestHeaders, body: { onboardingComplete: true } });
    await auth.api.setActiveOrganization({
        headers: requestHeaders,
        body: { organizationId: invitation.organizationId }
    });
    const member = await acceptedMembership(invitation.organizationId, session.user.id);
    return { destination: createOrgRoutes(member.organization.slug, member.role).dashboard };
}
