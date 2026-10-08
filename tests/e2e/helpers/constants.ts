import type { Route } from 'next';

/**
 * Centralized route constants for E2E tests.
 * Mirrors the application route registry to keep test expectations
 * aligned with the actual routing configuration.
 */

/** Public pages accessible without authentication. */
export const PUBLIC_ROUTES: Route[] = [
    '/' as Route,
    '/pricing' as Route,
    '/courses' as Route,
    '/about' as Route,
    '/contact' as Route,
    '/blog' as Route
];

/** Auth pages that render login/registration forms. */
export const AUTH_ROUTES: Route[] = [
    '/sign-in' as Route,
    '/sign-up' as Route,
    '/reset-password' as Route,
    '/new-password' as Route
];

/** Protected platform routes that require authentication. */
export const PROTECTED_PLATFORM_ROUTES: Route[] = [
    '/admin/dashboard' as Route,
    '/staff/dashboard' as Route,
    '/select-organization' as Route,
    '/create-organization' as Route
];

/** Protected org-scoped routes that require authentication + org membership. */
export const PROTECTED_ORG_ROUTES: string[] = [
    '/org/test-org/dashboard',
    '/org/test-org/courses',
    '/org/test-org/settings',
    '/org/test-org/members'
];
