import { z } from 'zod';

/** Only the invitation reference crosses the acceptance mutation boundary. */
export const invitationIdSchema = z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-zA-Z0-9_-]+$/);
export const acceptInvitationSchema = z.object({ invitationId: invitationIdSchema }).strict();

/** Private invitation details are returned only to the verified recipient. */
export type InvitationEntry =
    | { status: 'signed-out' | 'unverified' | 'wrong-account' | 'unknown' | 'expired' | 'cancelled' | 'unavailable' }
    | {
          status: 'pending' | 'accepted';
          organizationName: string;
          role: string;
          expiresAt: string;
          inviterEmail?: string;
      };
