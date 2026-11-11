import 'server-only';

import type { Route } from 'next';

import { requireCourseAccess } from '@/features/course/server/access';
import { destination, missingResource } from '@/server/auth/read-errors';
import { getAuthenticatedUser } from '@/server/auth/session';
import { prismaClient } from '@/server/db/client';
type PageProps = {
    params: Promise<{ courseId: string }>;
};
export async function B2CLearnRedirectPage(props: PageProps) {
    const params = await props.params;
    const { courseId } = params;

    const user = await getAuthenticatedUser();
    await requireCourseAccess(courseId, 'learn', undefined);

    const course = await prismaClient.course.findUnique({
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

    const progress = await prismaClient.userLessonProgress.findMany({
        where: { userId: user.id }
    });

    const completedLessonIds = new Set(progress.filter(p => p.isCompleted).map(p => p.lessonId));

    // Find the first incomplete lesson, or fallback to the first overall
    const targetLesson = allLessons.find(l => !completedLessonIds.has(l.id)) || allLessons[0];

    if (!targetLesson) missingResource();

    destination(`/learner/dashboard/learn/${courseId}/${targetLesson.id}` as Route);
}
