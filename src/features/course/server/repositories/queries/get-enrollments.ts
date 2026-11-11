import 'server-only';

/** @internal Repository API; application callers use authorized feature DALs. */
import type { Prisma, UserLessonProgress } from '@prisma/client';

import type { PrismaLike } from '@/features/course/server/repositories/types';

/**
 * Check if a user is enrolled in a specific course.
 * Uses the composite unique key `userId_courseId`.
 */
export async function getEnrollment(prisma: PrismaLike, userId: string, courseId: string) {
    return prisma.enrollment.findUnique({
        where: {
            userId_courseId: { courseId, userId }
        }
    });
}

/**
 * Fetch all enrollments for a user, including related course data.
 */
export async function getEnrollmentsByUserId(prisma: PrismaLike, userId: string) {
    return prisma.enrollment.findMany({
        include: {
            course: {
                select: {
                    description: true,
                    fileKey: true,
                    id: true,
                    shortDescription: true,
                    title: true
                }
            }
        },
        where: { userId }
    });
}

/**
 * Fetch all enrolled course IDs for a user.
 */
export async function getEnrolledCourseIdsByUserId(prisma: PrismaLike, userId: string): Promise<string[]> {
    const enrollments = await prisma.enrollment.findMany({
        select: { courseId: true },
        where: { userId }
    });
    return enrollments.map((e: { courseId: string }) => e.courseId);
}

/**
 * Fetch all enrollments for a user, including related course data, modules, lessons, and progress.
 * Used for calculating learner progress details on the dashboard.
 */
export async function getLearnerEnrollmentsWithProgressDetails(
    prisma: PrismaLike,
    userId: string
): Promise<
    Prisma.EnrollmentGetPayload<{
        include: {
            course: {
                include: {
                    modules: {
                        include: {
                            lessons: true;
                        };
                    };
                };
            };
        };
    }>[]
> {
    return prisma.enrollment.findMany({
        include: {
            course: {
                include: {
                    modules: {
                        include: {
                            lessons: true
                        }
                    }
                }
            }
        },
        orderBy: { updatedAt: 'desc' },
        where: { userId }
    });
}

/**
 * Fetch user lesson progress records.
 */
export async function getUserLessonProgress(prisma: PrismaLike, userId: string): Promise<UserLessonProgress[]> {
    return prisma.userLessonProgress.findMany({
        where: { userId }
    });
}
