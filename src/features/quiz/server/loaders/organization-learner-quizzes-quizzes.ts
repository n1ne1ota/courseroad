import 'server-only';

import { createOrgRoutes } from '@/lib/routes/org';

import { getLearnerQuizzesWithStats } from '@/features/quiz/server/repositories/orchestrators';
import { getOrganizationContext } from '@/server/auth/organization-context';
import { getAuthenticatedUser } from '@/server/auth/session';
import { getTenantPrisma } from '@/server/db/get-tenant-prisma';

/** Authorized quiz projection for LearnerQuizzesView. */
export async function loadLearnerQuizzesView({ orgSlug }: { orgSlug: string }) {
    await getOrganizationContext(orgSlug, 'learner');
    const user = await getAuthenticatedUser();
    const prisma = await getTenantPrisma(orgSlug, 'learner');
    const enrolledCourseIds = (
        await prisma.enrollment.findMany({ where: { userId: user.id }, select: { courseId: true } })
    ).map((enrollment: { courseId: string }) => enrollment.courseId);
    const quizzes = await getLearnerQuizzesWithStats(prisma, user.id, enrolledCourseIds);
    const orgRoutes = createOrgRoutes(orgSlug, 'learner');
    return { quizzes, orgRoutes };
}
