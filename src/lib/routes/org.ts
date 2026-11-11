import type { Route } from 'next';

export type OrgRole = 'owner' | 'manager' | 'creator' | 'instructor' | 'learner';

/**
 * Generates type-safe org-scoped route paths for a given organization slug and role.
 *
 * @example
 * ```ts
 * const r = createOrgRoutes('acme', 'owner');
 * // r.dashboard => '/organization/acme/owner/dashboard'
 * // r.courses => '/organization/acme/owner/courses'
 * ```
 */
export function createOrgRoutes(orgSlug: string, role?: string) {
    const base = `/organization/${orgSlug}` as const;
    const activeRole = (role || 'learner').toLowerCase() as OrgRole;
    const rolePath = `${base}/${activeRole}` as const;
    const dashBase = `${rolePath}/dashboard` as const;

    return {
        base,
        roleBase: rolePath,

        // Common/Shared routes but dynamic by role
        analytics: `${dashBase}/analytics` as Route,
        courses: `${dashBase}/courses` as Route,
        dashboard: dashBase as Route,
        learners: `${dashBase}/learners` as Route,
        members: `${dashBase}/members` as Route,
        quizzes: `${dashBase}/quizzes` as Route,
        settings: `${dashBase}/settings` as Route,

        // Specific sub-paths
        courseEdit: (courseId: string) => `${dashBase}/courses/${courseId}` as Route,
        learn: (courseId: string) => `${dashBase}/learn/${courseId}` as Route,
        learnLesson: (courseId: string, lessonId: string) => `${dashBase}/learn/${courseId}/${lessonId}` as Route,
        quizEditOrTake: (quizId: string) => `${dashBase}/quizzes/${quizId}` as Route
    } as const;
}

export type OrgRoutes = ReturnType<typeof createOrgRoutes>;

/**
 * Extracts the org slug from a pathname that starts with `/organization/[slug]/...`.
 * Returns null if the path doesn't match the org pattern.
 */
export function extractOrgSlug(pathname: string): string | null {
    const match = pathname.match(/^\/organization\/([^/]+)/);
    return match?.[1] ?? null;
}

/**
 * Derives the active role context based on the current pathname.
 */
export function getActiveRoleFromPath(pathname: string): OrgRole | null {
    if (!pathname.startsWith('/organization/')) return null;

    const segments = pathname.split('/');
    const role = segments[3]?.toLowerCase();
    const roles: OrgRole[] = ['owner', 'manager', 'creator', 'instructor', 'learner'];

    if (roles.includes(role as OrgRole)) return role as OrgRole;

    return null;
}
