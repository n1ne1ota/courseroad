import 'server-only';

import type { Route } from 'next';

import { createOrgRoutes } from '@/lib/routes/org';

import {
    getLearnerEnrollmentsWithProgressDetails,
    getUserLessonProgress
} from '@/features/course/server/repositories/queries/get-enrollments';
import { getOrganizationContext } from '@/server/auth/organization-context';
import { destination } from '@/server/auth/read-errors';
import { getAuthenticatedUser } from '@/server/auth/session';
import { getTenantPrisma } from '@/server/db/get-tenant-prisma';

type LearnerDashboardPageProps = {
    orgSlug: string;
};
/** Authorized course projection for LearnerDashboardPage. */
export async function loadLearnerDashboardPage({ orgSlug }: LearnerDashboardPageProps) {
    await getOrganizationContext(orgSlug, 'learner');
    const sessionUser = await getAuthenticatedUser();
    const prisma = await getTenantPrisma(orgSlug, 'learner');
    const user = await prisma.user.findUnique({
        select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            email: true,
            image: true,
            username: true,
            role: true
        },
        where: { id: sessionUser.id }
    });
    if (!user) destination('/sign-in' as Route);
    const enrollments = await getLearnerEnrollmentsWithProgressDetails(prisma, sessionUser.id);
    const lessonProgress = await getUserLessonProgress(prisma, sessionUser.id);
    let completedCoursesCount = 0;
    let inProgressCoursesCount = 0;
    const coursesWithProgress = enrollments.map(enrollment => {
        const courseLessons = enrollment.course.modules.flatMap(m => m.lessons.map(l => l.id));
        const totalLessons = courseLessons.length;
        const completedLessons = lessonProgress.filter(p => courseLessons.includes(p.lessonId) && p.isCompleted).length;

        let progressPercentage = 0;
        if (totalLessons > 0) {
            progressPercentage = Math.round((completedLessons / totalLessons) * 100);
        }

        let status: 'COMPLETED' | 'IN_PROGRESS' | 'NOT_STARTED' = 'NOT_STARTED';
        if (progressPercentage === 100) {
            status = 'COMPLETED';
            completedCoursesCount++;
        } else if (progressPercentage > 0) {
            status = 'IN_PROGRESS';
            inProgressCoursesCount++;
        }

        return {
            enrollment,
            progressPercentage,
            status
        };
    });
    const enrolledCount = enrollments.length;
    const resumeCourse = coursesWithProgress.find(c => c.status === 'IN_PROGRESS') || coursesWithProgress[0];
    const orgRoutes = createOrgRoutes(orgSlug, 'learner');
    return {
        user,
        completedCoursesCount,
        inProgressCoursesCount,
        coursesWithProgress,
        enrolledCount,
        resumeCourse,
        orgRoutes
    };
}
