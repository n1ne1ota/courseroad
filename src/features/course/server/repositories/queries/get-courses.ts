import 'server-only';

/** @internal Repository API; application callers use authorized feature DALs. */
import type { Course, Prisma } from '@prisma/client';

import type { PrismaLike } from '@/features/course/server/repositories/types';

/**
 * Published course list for the public catalog.
 * Ordered by most recently published.
 */
export async function getPublishedCourses(prisma: PrismaLike): Promise<Course[]> {
    return prisma.course.findMany({
        orderBy: { publishedAt: 'desc' },
        where: { status: 'Published' }
    });
}

/**
 * Single course lookup by unique ID.
 * Returns `null` when the course does not exist.
 */
export async function getCourseById(prisma: PrismaLike, courseId: string) {
    return prisma.course.findUnique({
        where: { id: courseId }
    });
}

/**
 * First course matching the filter — useful when combining multiple
 * conditions that may produce more than one result.
 */
export async function getCourseByFilter(
    prisma: PrismaLike,
    where: Prisma.CourseWhereInput,
    include?: Prisma.CourseInclude
) {
    return prisma.course.findFirst({
        ...(include ? { include } : {}),
        where
    });
}

/**
 * Courses created by a specific user (creator dashboard).
 * Ordered by most recently created.
 */
export async function getCoursesByUserId(prisma: PrismaLike, userId: string) {
    return prisma.course.findMany({
        orderBy: { createdAt: 'desc' },
        where: { userId }
    });
}

/**
 * Check whether a course slug already exists for a given user.
 */
export async function getCourseBySlug(prisma: PrismaLike, userId: string, slug: string) {
    return prisma.course.findUnique({
        where: {
            userId_slug: { slug, userId }
        }
    });
}
