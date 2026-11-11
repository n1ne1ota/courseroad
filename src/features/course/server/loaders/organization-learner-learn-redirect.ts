import 'server-only';

import type { JSX } from 'react';

import { createOrgRoutes } from '@/lib/routes/org';

import { requireCourseAccess } from '@/features/course/server/access';
import { destination, missingResource } from '@/server/auth/read-errors';
import { getAuthenticatedUser } from '@/server/auth/session';
import { getTenantPrisma } from '@/server/db/get-tenant-prisma';
type LearnRedirectViewProps = {
    courseId: string;
    slug: string;
};
export async function LearnRedirectView({ courseId, slug }: LearnRedirectViewProps): Promise<JSX.Element | null> {
    const orgSlug = slug;
    const user = await getAuthenticatedUser();
    await requireCourseAccess(courseId, 'learn', slug);
    const prisma = await getTenantPrisma(slug, 'learner');

    const course = await prisma.course.findUnique({
        include: {
            modules: {
                include: {
                    lessons: { orderBy: { order: 'asc' } }
                },
                orderBy: { order: 'asc' }
            }
        },
        where: { id: courseId }
    });

    if (!course) missingResource();

    const allLessons = course.modules.flatMap(m => m.lessons);
    if (allLessons.length === 0) missingResource();

    const progress = await prisma.userLessonProgress.findMany({
        where: { userId: user.id }
    });

    const completedLessonIds = new Set(progress.filter(p => p.isCompleted).map(p => p.lessonId));

    // Find the first incomplete lesson, or fallback to the first overall
    const targetLesson = allLessons.find(l => !completedLessonIds.has(l.id)) || allLessons[0];

    if (!targetLesson) missingResource();

    const orgRoutes = createOrgRoutes(orgSlug, 'learner');
    destination(orgRoutes.learnLesson(courseId, targetLesson.id));
    return null;
}
