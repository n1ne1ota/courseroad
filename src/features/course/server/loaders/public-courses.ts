import 'server-only';

import { cacheLife, cacheTag } from 'next/cache';

import { getCoursesWithCreators } from '@/features/course/server/db/orchestrators';
import { prismaClient } from '@/server/db/client';

/** Authorized course projection for CoursesPage. */
export async function loadCoursesPage() {
    'use cache';
    cacheLife('hours');
    cacheTag('course-catalog');
    const publishedCourses = await getCoursesWithCreators(prismaClient);
    return { publishedCourses };
}
