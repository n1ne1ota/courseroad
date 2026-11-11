import type { BetterAuthSession, UserDropdownData } from '@/types/user.types';

/**
 * Transforms a Better Auth session object into UserDropdownData
 * Normalizes the user data structure for consistent usage across components
 */
export function transformSessionUser(session: BetterAuthSession): UserDropdownData {
    return {
        email: session.user.email,
        id: session.user.id,
        image: session.user.image ?? null,
        name: session.user.name ?? undefined
    };
}
