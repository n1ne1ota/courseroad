import 'server-only';

import { isSelfServicePlatformRole } from '@/lib/auth/self-service-roles';

/** Environment assignments take precedence; otherwise preserve the chosen persona. */
export function resolvePlatformRole(
    user: { email: string; role?: string | null },
    assignments: { ADMIN_EMAILS: readonly string[]; STAFF_EMAILS: readonly string[]; CREATOR_EMAILS: readonly string[] }
) {
    const email = user.email.toLowerCase();
    if (assignments.ADMIN_EMAILS.includes(email)) return 'admin';
    if (assignments.STAFF_EMAILS.includes(email)) return 'staff';
    if (assignments.CREATOR_EMAILS.includes(email)) return 'creator';
    return isSelfServicePlatformRole(user.role) ? user.role : 'learner';
}
