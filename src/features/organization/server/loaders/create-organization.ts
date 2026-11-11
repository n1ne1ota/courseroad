import 'server-only';

import type { Route } from 'next';

import { destination } from '@/server/auth/read-errors';
import { getSession } from '@/server/auth/session';

/** Authorized organization projection for CreateOrganizationPage. */
export async function loadCreateOrganizationPage() {
    const session = await getSession();
    if (!session?.user) destination('/sign-in' as Route);
    return {};
}
