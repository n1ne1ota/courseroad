import 'server-only';

/** @internal Repository API; application callers use authorized feature DALs. */
import type { Course, Prisma } from '@prisma/client';

import { getCourseByFilter, getPublishedCourses } from '@/features/course/server/repositories/queries/get-courses';
import { getUsersByIds } from '@/server/auth/queries';

import type { PrismaLike as CoursePrismaLike } from '@/features/course/server/repositories/types';
import type { UserInfo } from '@/server/auth/user-info';
import type { PrismaLike as AuthPrismaLike } from '@/server/auth/user-info';

type PrismaLike = CoursePrismaLike & AuthPrismaLike;

type CourseWithCurriculum = Prisma.CourseGetPayload<{
    include: {
        modules: {
            include: {
                lessons: true;
            };
        };
    };
}>;

export type CourseWithCreator<T = Course> = T & {
    creator: UserInfo | null;
};

/**
 * Fetch all published courses and attach their creator information using batch lookups.
 */
export async function getCoursesWithCreators(prisma: PrismaLike): Promise<CourseWithCreator[]> {
    const courses = await getPublishedCourses(prisma);
    const userIds = [...new Set(courses.map((c: Course) => c.userId))] as string[];
    const userMap = await getUsersByIds(prisma, userIds);

    return courses.map((course: Course) => ({
        ...course,
        creator: userMap.get(course.userId) ?? null
    }));
}

/**
 * Fetch a single course by ID or slug, and attach its creator information.
 */
export async function getCourseWithCreator(
    prisma: PrismaLike,
    courseIdOrSlug: string
): Promise<CourseWithCreator<CourseWithCurriculum> | null> {
    const course = (await getCourseByFilter(
        prisma,
        {
            OR: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(courseIdOrSlug)
                ? [{ id: courseIdOrSlug }, { slug: courseIdOrSlug }]
                : [{ slug: courseIdOrSlug }],
            status: 'Published'
        },
        {
            modules: {
                include: {
                    lessons: {
                        orderBy: { order: 'asc' }
                    }
                },
                orderBy: { order: 'asc' }
            }
        }
    )) as CourseWithCurriculum | null;

    if (!course) return null;

    const userMap = await getUsersByIds(prisma, [course.userId]);

    return {
        ...course,
        creator: userMap.get(course.userId) ?? null
    };
}
