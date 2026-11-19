import 'server-only';

import type { PrismaClient } from '@prisma/client';

import { verifyUnsubscribeToken } from '../unsubscribe-token';

/** Turns announcement email off for the user a valid token names. Returns whether the token was valid. */
export async function unsubscribeByToken(
    db: Pick<PrismaClient, 'user'>,
    secret: string,
    token: string | null | undefined
): Promise<boolean> {
    const userId = verifyUnsubscribeToken(token, secret);
    if (!userId) return false;
    await db.user.updateMany({ data: { announcementEmails: false }, where: { id: userId } });
    return true;
}
