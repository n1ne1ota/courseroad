import 'server-only';

import type { Route } from 'next';

import { destination } from '@/server/auth/read-errors';
import { getSession } from '@/server/auth/session';

/** Authorized auth projection for OnboardingLayout. */
export async function loadOnboardingLayout() {
    const session = await getSession();
    if (!session?.user) {
        destination('/sign-in' as Route);
    }
    return {};
}
