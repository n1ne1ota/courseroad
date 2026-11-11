import 'server-only';

import { createOrgRoutes } from '@/lib/routes/org';

import { markLessonComplete } from '@/features/course/actions/learning-actions';
import { requireLessonAccess } from '@/features/course/server/access';
import { getOrganizationContext } from '@/server/auth/organization-context';
import { missingResource } from '@/server/auth/read-errors';
import { getAuthenticatedUser } from '@/server/auth/session';
import { getTenantPrisma } from '@/server/db/get-tenant-prisma';

type LessonViewProps = {
    courseId: string;
    lessonId: string;
    slug: string;
};
/** Authorized course projection for LessonView. */
export async function loadLessonView({ courseId, lessonId, slug }: LessonViewProps) {
    await getOrganizationContext(slug, 'learner');
    const orgSlug = slug;
    const user = await getAuthenticatedUser();
    await requireLessonAccess(courseId, lessonId, slug);
    const prisma = await getTenantPrisma(slug, 'learner');
    const lesson = await prisma.lesson.findUnique({
        include: {
            module: {
                include: {
                    course: {
                        include: {
                            modules: {
                                include: {
                                    lessons: { orderBy: { order: 'asc' } }
                                },
                                orderBy: { order: 'asc' }
                            }
                        }
                    }
                }
            }
        },
        where: { id: lessonId }
    });
    if (!lesson || lesson.module.courseId !== courseId) missingResource();
    const progress = await prisma.userLessonProgress.findUnique({
        where: {
            userId_lessonId: {
                lessonId: lesson.id,
                userId: user.id
            }
        }
    });
    const isCompleted = progress?.isCompleted ?? false;
    const course = lesson.module.course;
    let nextLessonId: string | null = null;
    const allLessons = course.modules.flatMap(m => m.lessons);
    const currentIdx = allLessons.findIndex(l => l.id === lesson.id);
    if (currentIdx !== -1 && currentIdx < allLessons.length - 1) {
        const nextLesson = allLessons[currentIdx + 1];
        if (nextLesson) nextLessonId = nextLesson.id;
    }
    const markCompleteAction = async () => {
        'use server';
        await markLessonComplete({ courseId, lessonId });
    };
    const orgRoutes = createOrgRoutes(orgSlug, 'learner');
    return { lesson, isCompleted, nextLessonId, markCompleteAction, orgRoutes };
}
