'use client';

import { useRef, useState } from 'react';

import { authClient } from '@/lib/auth/auth-client';
import { createOrgRoutes } from '@/lib/routes/org';

import {
    type Intent,
    inviteRowsSchema,
    type OrganizationInviteRow,
    workspaceDetailsSchema
} from '@/features/onboarding/schemas/schemas';

type InvitationOutcome = OrganizationInviteRow & { status: 'pending' | 'sent' | 'failed'; error?: string };
type CreatedOrganization = { id: string; name: string; slug: string };
type SetupProgress = {
    organization: CreatedOrganization | null;
    invitations: InvitationOutcome[];
    active: boolean;
    complete: boolean;
    ready: boolean;
    busy: boolean;
    error: string | null;
};

/** Keep creation and completed work across retries; refs synchronously prevent double submission. */
export function useOrganizationSetup() {
    const current = useRef<SetupProgress>({
        organization: null,
        invitations: [],
        active: false,
        complete: false,
        ready: false,
        busy: false,
        error: null
    });
    const [progress, setProgress] = useState(current.current);
    function publish(changes: Partial<SetupProgress>) {
        current.current = { ...current.current, ...changes };
        setProgress(current.current);
    }
    function destination() {
        const state = current.current;
        return state.ready && state.organization ? createOrgRoutes(state.organization.slug, 'owner').dashboard : null;
    }
    async function sendInvitation(row: InvitationOutcome, resend: boolean) {
        try {
            const organization = current.current.organization;
            if (!organization) throw new Error('Create your organization before inviting the team.');
            const result = await authClient.organization.inviteMember({
                organizationId: organization.id,
                email: row.email,
                role: row.role,
                ...(resend ? { resend: true } : {})
            });
            if (result.error) throw new Error(result.error.message ?? 'Failed to send invitation.');
            publish({
                invitations: current.current.invitations.map(existing =>
                    existing.id === row.id ? { ...existing, status: 'sent', error: undefined } : existing
                )
            });
        } catch (error) {
            publish({
                invitations: current.current.invitations.map(existing =>
                    existing.id === row.id
                        ? {
                              ...existing,
                              status: 'failed',
                              error: error instanceof Error ? error.message : 'The invitation request failed.'
                          }
                        : existing
                )
            });
        }
    }
    async function finishSetup() {
        const organization = current.current.organization;
        if (!organization) throw new Error('Your organization has not been created yet.');
        const membership = await authClient.organization.getActiveMemberRole({
            query: { organizationId: organization.id }
        });
        if (membership.error || membership.data?.role !== 'owner')
            throw new Error('Could not verify your owner membership. Retry setup, or contact support.');
        if (!current.current.active) {
            const result = await authClient.organization.setActive({ organizationId: organization.id });
            if (result.error) throw new Error(result.error.message ?? 'Could not activate your organization.');
            publish({ active: true });
        }
        if (!current.current.complete) {
            // The account endpoint avoids a Server Action cookie refresh redirecting
            // the wizard before invitation results and retries can be displayed.
            const result = await authClient.updateUser({ onboardingComplete: true });
            if (result.error || !result.data?.status)
                throw new Error(result.error?.message ?? 'Could not complete onboarding.');
            publish({ complete: true });
        }
        publish({ ready: true });
        // Only not-yet-attempted rows run here. Failed emails require explicit retry.
        for (const row of current.current.invitations.filter(row => row.status === 'pending'))
            await sendInvitation(row, false);
    }
    async function perform(operation: () => Promise<void>) {
        if (current.current.busy) return undefined;
        publish({ busy: true, error: null });
        try {
            await operation();
        } catch (error) {
            publish({ error: error instanceof Error ? error.message : 'Setup failed. Retry to continue.' });
        } finally {
            publish({ busy: false });
        }
        return {
            created: current.current.organization !== null,
            destination: current.current.invitations.length === 0 ? destination() : null
        };
    }
    function create(input: {
        name: string;
        slug: string;
        intent: Intent | null;
        invitations: OrganizationInviteRow[];
    }) {
        return perform(async () => {
            if (!current.current.organization) {
                const details = workspaceDetailsSchema.parse(input);
                const invitations = inviteRowsSchema.parse(input.invitations);
                const result = await authClient.organization.create({
                    ...details,
                    ...(input.intent ? { metadata: { intent: input.intent } } : {})
                });
                if (result.error) throw new Error(result.error.message ?? 'Failed to create organization.');
                if (!result.data?.id || !result.data.slug)
                    throw new Error('The organization response was incomplete. Refresh to recover your organization.');
                publish({
                    organization: { id: result.data.id, slug: result.data.slug, name: result.data.name },
                    invitations: invitations.map(row => ({ ...row, status: 'pending' }))
                });
            }
            await finishSetup();
        });
    }
    function retrySetup() {
        return perform(finishSetup);
    }
    function retryInvitation(id: string) {
        return perform(async () => {
            if (!current.current.ready) throw new Error('Finish organization setup before retrying invitations.');
            const row = current.current.invitations.find(row => row.id === id && row.status === 'failed');
            if (row) await sendInvitation(row, true);
        });
    }
    return { progress, create, retrySetup, retryInvitation, destination };
}
