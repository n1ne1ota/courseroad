import 'server-only';

import { cacheLife } from 'next/cache';

import { getCoursesWithCreators } from '@/features/course/server/repositories/orchestrators';
import { prismaClient } from '@/server/db/client';

/** Authorized course projection for CoursesPage. */
export async function loadCoursesPage() {
    'use cache';
    cacheLife('hours');
    const publishedCourses = await getCoursesWithCreators(prismaClient);
    return { publishedCourses };
}
