/**
 * Better Auth session type definition
 * Represents the session object returned by Better Auth's useSession hook
 */
export interface BetterAuthSession {
    user: {
        id: string;
        name?: string;
        email: string;
        image?: string | null | undefined;
    };
}

/**
 * User data structure for dropdown/display components
 * Used across authentication and profile-related UI components
 * Derived from BetterAuthSession via transformSessionUser utility
 */
export interface UserDropdownData {
    email: string;
    id: string;
    image?: string | null | undefined;
    name?: string | undefined;
}
