'use server';

import { acceptInvitationSchema } from '@/features/organization/invitation-contract';
import { acceptOrganizationInvitation } from '@/features/organization/server/invitations';
import { createSafeAction } from '@/server/actions/create-safe-action';

/** Thin transport; recipient and resource authorization live in the DAL. */
export const acceptInvitation = createSafeAction(acceptInvitationSchema, acceptOrganizationInvitation);
