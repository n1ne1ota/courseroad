import 'server-only';

import { getSession } from '@/server/auth/session';

/**
 * Server Action authentication guard. Validates the session and throws
 * if the user is unauthenticated. Unlike `requireAuth()`, this helper
 * throws instead of redirecting, which is the correct behavior for
 * Server Actions that return structured error responses.
 *
 * @throws {Error} If no valid session exists.
 * @returns The authenticated user object.
 */
export async function requireAuthAction() {
    const session = await getSession();

    if (!session?.user) {
        throw new Error('Unauthorized');
    }

    return session.user;
}
