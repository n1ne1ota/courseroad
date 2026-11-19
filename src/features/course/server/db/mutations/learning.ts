import 'server-only';

/** @internal Repository API; application callers use authorized feature DALs. */
import type { PrismaLike } from '@/features/course/server/db/types';

export async function enrollInCourse(
    prisma: PrismaLike,
    courseId: string,
    userId: string,
    organizationId: string | null
) {
    return prisma.$transaction(async tx => {
        await tx.$queryRaw`SELECT "id" FROM "course" WHERE "id" = ${courseId}::uuid FOR UPDATE`;
        const course = await tx.course.findUnique({ where: { id: courseId, organizationId } });
        if (!course || course.status !== 'Published' || course.visibility === 'Private' || (course.price ?? 0) > 0)
            throw new Error('Course cannot be enrolled for free');
        return tx.enrollment.upsert({
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
