'use client';

import { useMemo, useSyncExternalStore } from 'react';

import { useSession } from '@/lib/auth/auth-client';
import { transformSessionUser } from '@/lib/utils/auth-helpers';

import type { UserDropdownData } from '@/types/user.types';

export interface NavUser {
    /** True until the client has mounted and the session request has settled, so the UI can render a stable placeholder. */
    isPending: boolean;
    /** The signed-in user in the shape the account controls expect, or `null` when signed out or still loading. */
    user: UserDropdownData | null;
}

/**
 * The signed-in user for the landing navigation, shared by the desktop and mobile navbars.
 * The user is withheld until mount so server and first client render agree and hydration does not mismatch.
 */
export function useNavUser(): NavUser {
    const { data: session, isPending } = useSession();
    const mounted = useSyncExternalStore(
        () => () => {},
        () => true,
        () => false
    );

    const user = useMemo(() => (mounted && session ? transformSessionUser(session) : null), [mounted, session]);

    return { isPending: !mounted || isPending, user };
}
