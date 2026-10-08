import 'server-only';

import type { Route } from 'next';
import { redirect } from 'next/navigation';

import { protectedRoutes } from '@/lib/routes';

import { getSession } from '@/server/auth/session';

/**
 * Server-side role guard. Call at the top of a route layout to enforce role access.
 * Redirects to `redirectTo` if the user is unauthenticated or has the wrong role.
 *
 * @example
 * // app/(dashboard)/admin/layout.tsx
 * export default async function AdminLayout({ children }) {
 *   await requireRole('ADMIN');
 *   return <>{children}</>;
 * }
 */
export async function requireRole(role: string, redirectTo: Route = protectedRoutes.selectOrganization as Route) {
    const session = await getSession();

    if (!session?.user) redirect('/sign-in' as Route);

    const userRole = ((session.user as { id: string; role?: string }).role || '').toLowerCase();

    if (userRole !== role.toLowerCase()) redirect(redirectTo);

    return session.user;
}
