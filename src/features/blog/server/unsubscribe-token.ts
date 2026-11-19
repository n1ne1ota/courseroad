import 'server-only';

import { createHmac, timingSafeEqual } from 'node:crypto';

import { z } from 'zod';

const PURPOSE = 'announcement-email';
const USER_ID = z.uuid();

function mac(userId: string, secret: string): Buffer {
    return createHmac('sha256', secret).update(`${PURPOSE}:${userId}`).digest();
}

/**
 * A token that lets the holder switch off announcement email for one user, without signing in. It is the user id and an
 * HMAC-SHA-256 of that id and the purpose, keyed from the application secret, so it cannot be forged and cannot be used
 * for anything else. It carries no expiry on purpose: an unsubscribe link in an old email must keep working.
 */
export function signUnsubscribeToken(userId: string, secret: string): string {
    return `${userId}.${mac(userId, secret).toString('base64url')}`;
}

/** The user id a valid token names, or `null` for anything tampered with, truncated, or made for another purpose. */
export function verifyUnsubscribeToken(token: string | null | undefined, secret: string): string | null {
    if (!token || token.length > 200) return null;
    const separator = token.indexOf('.');
    if (separator === -1) return null;

    const userId = token.slice(0, separator);
    if (!USER_ID.safeParse(userId).success) return null;

    const given = Buffer.from(token.slice(separator + 1), 'base64url');
    const expected = mac(userId, secret);
    if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
    return userId;
}
