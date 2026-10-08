import 'server-only';

import { createOrgRoutes } from '@/lib/routes/org';

import { getQuizzesByUserId } from '@/features/quiz/server/repositories/queries';
import { getOrganizationContext } from '@/server/auth/organization-context';
import { getAuthenticatedUser } from '@/server/auth/session';
import { getTenantPrisma } from '@/server/db/get-tenant-prisma';

type CreatorQuizzesViewProps = {
    orgSlug: string;
    role: string;
};
/** Authorized quiz projection for CreatorQuizzesView. */
export async function loadCreatorQuizzesView({ orgSlug, role }: CreatorQuizzesViewProps) {
    await getOrganizationContext(orgSlug, 'creator');
    const user = await getAuthenticatedUser();
    const prisma = await getTenantPrisma(orgSlug, 'creator');
    const quizzes = await getQuizzesByUserId(prisma, user.id);
    const orgRoutes = createOrgRoutes(orgSlug, role);
    return { quizzes, orgRoutes };
}
