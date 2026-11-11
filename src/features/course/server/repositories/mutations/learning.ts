import 'server-only';

/** @internal Repository API; application callers use authorized feature DALs. */
import type { PrismaLike } from '@/features/course/server/repositories/types';

export async function enrollInCourse(
    prisma: PrismaLike,
    courseId: string,
    userId: string,
    organizationId: string | null
) {
    return prisma.enrollment.upsert({
        create: {
            courseId,
            organizationId,
            source: 'Free',
            userId
        },
        update: {}, // Already enrolled
        where: {
            userId_courseId: {
                courseId,
                userId
            }
        }
    });
}

export async function markLessonComplete(
    prisma: PrismaLike,
    _courseId: string,
    lessonId: string,
    userId: string,
    organizationId: string | null
) {
    return prisma.userLessonProgress.upsert({
        create: {
            completedAt: new Date(),
            isCompleted: true,
            lessonId,
            organizationId,
            userId
        },
        update: {
            completedAt: new Date(),
            isCompleted: true
        },
        where: {
            userId_lessonId: {
                lessonId,
                userId
            }
        }
    });
}
