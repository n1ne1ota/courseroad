import 'server-only';

import type { Route } from 'next';
import { redirect } from 'next/navigation';

import { getSession } from '@/server/auth/session';

/**
 * Server-side authentication guard. Call at the top of a route layout or page to enforce access.
 * Redirects to `/sign-in` if the user is unauthenticated.
 *
 * @example
 * // app/(learner)/layout.tsx
 * export default async function LearnerLayout({ children }) {
 *   await requireAuth();
 *   return <>{children}</>;
 * }
 */
export async function requireAuth() {
    const session = await getSession();

    if (!session?.user) {
        redirect('/sign-in' as Route);
    }

    return session.user;
}
