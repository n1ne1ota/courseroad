import 'server-only';

import { cache } from 'react';

import { headers } from 'next/headers';

import { auth } from '@/server/auth/auth';

/** Session reads are shared only within a React server request. */
export const getSession = cache(async () => auth.api.getSession({ headers: await headers() }));

export class AccessError extends Error {
    constructor(
        message: string,
        readonly status: 401 | 403 | 404 = 403
    ) {
        super(message);
        this.name = 'AccessError';
    }
}

/** Authoritative authentication for DALs; presentation adapters handle redirects. */
export async function getAuthenticatedUser() {
    const session = await getSession();
    if (!session?.user) throw new AccessError('Unauthorized', 401);
    return session.user;
}

/** Platform role checks are independent of route layouts. */
export async function getPlatformUser(role: string) {
    const user = await getAuthenticatedUser();
    if ((user.role ?? '').toLowerCase() !== role.toLowerCase()) throw new AccessError('Forbidden');
    return user;
}
