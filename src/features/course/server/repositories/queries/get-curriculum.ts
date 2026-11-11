import 'server-only';

/** @internal Repository API; application callers use authorized feature DALs. */
import type { PrismaLike } from '@/features/course/server/repositories/types';

/**
 * Fetch a course with its full curriculum (modules and lessons).
 * Used in the learning interface to render the sidebar.
 */
export async function getCourseWithCurriculum(prisma: PrismaLike, courseId: string) {
    return prisma.course.findUnique({
        include: {
            modules: {
                include: {
                    lessons: {
                        orderBy: { order: 'asc' as const }
                    }
                },
                orderBy: { order: 'asc' as const }
            }
        },
        where: { id: courseId }
    });
}

/**
 * Fetch lesson progress for a user across a set of lesson IDs.
 * Returns completed and in-progress lesson tracking data.
 */
export async function getLessonProgress(prisma: PrismaLike, userId: string, lessonIds: string[]) {
    if (lessonIds.length === 0) return [];

    return prisma.userLessonProgress.findMany({
        where: {
            lessonId: { in: lessonIds },
            userId
        }
    });
}

/**
 * Fetch a single lesson by ID.
 */
export async function getLessonById(prisma: PrismaLike, lessonId: string) {
    return prisma.lesson.findUnique({
        where: { id: lessonId }
    });
}
