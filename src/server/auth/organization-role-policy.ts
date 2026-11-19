import 'server-only';

import type { BetterAuthPlugin } from 'better-auth';

import { APIError, createAuthMiddleware, getAuthoritativeSessionFromCtx } from 'better-auth/api';
import { bearer, organization } from 'better-auth/plugins';

import { orgAc, orgCreator, orgInstructor, orgLearner, orgManager, orgOwner } from '@/lib/auth/org-permissions';
import {
    canAssignOrganizationRole,
    canManageOrganizationMember,
    isOrganizationMemberRole
} from '@/lib/auth/org-role-policy';
import { isSelfServicePlatformRole } from '@/lib/auth/self-service-roles';

import type { OrganizationInvitationEmailInput } from '@/server/email/service';

type PolicyMember = { userId: string; organizationId: string; role: string };
type PolicyInvitation = { organizationId: string; role: string; expiresAt: Date | string };

const mutationPaths = new Set([
    '/organization/invite-member',
    '/organization/update-member-role',
    '/organization/remove-member',
    '/organization/cancel-invitation',
    '/organization/leave',
    '/update-user'
]);
const authenticateBearer = bearer().hooks.before[0]?.handler;

function forbidden(): never {
    throw new APIError('FORBIDDEN', { message: 'You are not allowed to perform this organization or role change.' });
}

/** Server-only endpoints have no URL; dispatch identifies addMember by operation ID. */
function isDirectMemberAddition(context: object): boolean {
    return 'operationId' in context && context.operationId === 'addOrganizationMember';
}

/**
 * Guard native Better Auth mutations before its handlers run, including the resend
 * branch that bypasses beforeCreateInvitation. Hook user objects can represent the
 * target rather than the caller, so resolve the authoritative session here.
 */
export const organizationRolePolicy = {
    id: 'courseroad-organization-role-policy',
    hooks: {
        before: [
            {
                matcher: context => mutationPaths.has(context.path ?? '') || isDirectMemberAddition(context),
                handler: createAuthMiddleware(async ctx => {
                    if (isDirectMemberAddition(ctx)) forbidden();
                    // Before-hook header changes are applied only after all hooks finish.
                    // Use Better Auth's own bearer verifier here so policy sees the same
                    // authenticated headers that the endpoint will receive.
                    const authentication = await authenticateBearer?.({ ...ctx, returnHeaders: false });
                    const session = await getAuthoritativeSessionFromCtx({ ...ctx, ...authentication?.context });
                    if (!session) throw new APIError('UNAUTHORIZED', { message: 'Session required.' });
                    const body = ctx.body;

                    if (ctx.path === '/update-user') {
                        if (
                            body?.role !== undefined &&
                            (!isSelfServicePlatformRole(body.role) || !isSelfServicePlatformRole(session.user.role))
                        )
                            forbidden();
                        return;
                    }

                    // Mutations must select their organization explicitly; a preference in
                    // another browser tab must never choose the tenant being administered.
                    let organizationId: unknown = body?.organizationId;
                    let invitation: PolicyInvitation | null = null;
                    if (ctx.path === '/organization/cancel-invitation') {
                        if (typeof body?.invitationId !== 'string') forbidden();
                        invitation = await ctx.context.adapter.findOne<PolicyInvitation>({
                            model: 'invitation',
                            where: [{ field: 'id', value: body.invitationId }]
                        });
                        if (!invitation) forbidden();
                        organizationId = invitation.organizationId;
                    }
                    if (typeof organizationId !== 'string' || !organizationId) forbidden();

                    const actor = await ctx.context.adapter.findOne<PolicyMember>({
                        model: 'member',
                        where: [
                            { field: 'organizationId', value: organizationId },
                            { field: 'userId', value: session.user.id }
                        ]
                    });
                    if (!actor) forbidden();

                    if (ctx.path === '/organization/leave') {
                        // Ownership changes require a separate workflow. Blocking all
                        // owner leaves also prevents concurrent owners leaving the org empty.
                        if (!isOrganizationMemberRole(actor.role)) forbidden();
                        return;
                    }

                    if (ctx.path === '/organization/cancel-invitation') {
                        if (!canAssignOrganizationRole(actor.role, invitation?.role)) forbidden();
                        return;
                    }

                    if (ctx.path === '/organization/invite-member') {
                        if (!canAssignOrganizationRole(actor.role, body?.role)) forbidden();
                        if (typeof body.email !== 'string')
                            throw new APIError('BAD_REQUEST', { message: 'Invalid email address.' });
                        const email = body.email.trim().toLowerCase();
                        if (body.resend) {
                            const pending = await ctx.context.adapter.findMany<PolicyInvitation>({
                                model: 'invitation',
                                where: [
                                    { field: 'organizationId', value: organizationId },
                                    { field: 'email', value: email },
                                    { field: 'status', value: 'pending' }
                                ]
                            });
                            // Better Auth resends the stored role, ignoring the requested role.
                            const active = pending.filter(existing => new Date(existing.expiresAt) > new Date());
                            if (active.some(existing => !canAssignOrganizationRole(actor.role, existing.role)))
                                forbidden();
                            if (active.some(existing => existing.role !== body.role)) {
                                throw new APIError('BAD_REQUEST', {
                                    message:
                                        'Resend must preserve the invited role. Cancel the invitation before choosing a different role.'
                                });
                            }
                        }
                        // The installed library normally swallows callback failures, even
                        // when awaited. Override only this request's delivery boundary.
                        return {
                            context: {
                                body: { ...body, email },
                                context: { runInBackgroundOrAwait: awaitInvitationDelivery }
                            }
                        };
                    }

                    let target: PolicyMember | null = null;
                    if (ctx.path === '/organization/update-member-role') {
                        if (typeof body?.memberId !== 'string' || !canAssignOrganizationRole(actor.role, body.role))
                            forbidden();
                        target = await ctx.context.adapter.findOne<PolicyMember>({
                            model: 'member',
                            where: [
                                { field: 'id', value: body.memberId },
                                { field: 'organizationId', value: organizationId }
                            ]
                        });
                    } else {
                        if (typeof body?.memberIdOrEmail !== 'string') forbidden();
                        if (body.memberIdOrEmail.includes('@')) {
                            const user = await ctx.context.adapter.findOne<{ id: string }>({
                                model: 'user',
                                where: [{ field: 'email', value: body.memberIdOrEmail.toLowerCase() }]
                            });
                            if (!user) forbidden();
                            target = await ctx.context.adapter.findOne<PolicyMember>({
                                model: 'member',
                                where: [
                                    { field: 'userId', value: user.id },
                                    { field: 'organizationId', value: organizationId }
                                ]
                            });
                        } else {
                            target = await ctx.context.adapter.findOne<PolicyMember>({
                                model: 'member',
                                where: [
                                    { field: 'id', value: body.memberIdOrEmail },
                                    { field: 'organizationId', value: organizationId }
                                ]
                            });
                        }
                    }
                    if (!target || !canManageOrganizationMember(actor, target)) forbidden();
                    return;
                })
            }
        ]
    }
} satisfies BetterAuthPlugin;

/** Legacy invitations must not grant owner, default Better Auth, or multiple roles. */
export async function validateOrganizationInvitationRole({ invitation }: { invitation: { role: string } }) {
    if (!isOrganizationMemberRole(invitation.role)) forbidden();
}

/** Surface provider failures instead of Better Auth's background-task success fallback. */
async function awaitInvitationDelivery(task: Promise<unknown>) {
    try {
        await task;
    } catch {
        throw new APIError('BAD_GATEWAY', {
            code: 'ORGANIZATION_INVITATION_DELIVERY_FAILED',
            message: 'The invitation email could not be sent. Find the invitation in Members and use Resend to retry.'
        });
    }
}

/** Shared production configuration with an injected, awaited invitation sender. */
export function createOrganizationPlugin(
    sendInvitation: (input: OrganizationInvitationEmailInput) => Promise<unknown>
) {
    return organization({
        ac: orgAc,
        allowUserToCreateOrganization: true,
        creatorRole: 'owner',
        async sendInvitationEmail({ id, email, inviter, organization: invitedOrganization, invitation }) {
            if (!isOrganizationMemberRole(invitation.role)) forbidden();
            await sendInvitation({
                invitationId: id,
                email,
                organizationName: invitedOrganization.name,
                inviterName: inviter.user.name || inviter.user.email,
                role: invitation.role,
                expiresAt: invitation.expiresAt
            });
        },
        organizationHooks: {
            beforeAcceptInvitation: validateOrganizationInvitationRole
        },
        requireEmailVerificationOnInvitation: true,
        roles: {
            creator: orgCreator,
            instructor: orgInstructor,
            learner: orgLearner,
            manager: orgManager,
            owner: orgOwner
        },
        schema: {
            member: { modelName: 'Member' }
        }
    });
}
