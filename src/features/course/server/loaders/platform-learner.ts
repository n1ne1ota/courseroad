import 'server-only';

import { cache } from 'react';

import type { Route } from 'next';

import { getPublishedCourses } from '@/features/course/server/db/queries/get-courses';
import {
    getLearnerEnrollmentsWithProgressDetails,
    getUserLessonProgress
} from '@/features/course/server/db/queries/get-enrollments';
import { destination } from '@/server/auth/read-errors';
import { getAuthenticatedUser } from '@/server/auth/session';
import { prismaClient } from '@/server/db/client';

/**
 * Enrollment progress shared by the hero, My Learning, and recommendations.
 * `cache` dedupes it per request so sibling Suspense sections don't repeat the queries.
 */
const loadEnrollmentProgress = cache(async (userId: string) => {
    const [enrollments, lessonProgress] = await Promise.all([
        getLearnerEnrollmentsWithProgressDetails(prismaClient, userId),
        getUserLessonProgress(prismaClient, userId)
    ]);
    let inProgressCount = 0;
    const coursesWithProgress = enrollments.map(enrollment => {
        const courseLessons = enrollment.course.modules.flatMap(m => m.lessons.map(l => l.id));
        const totalLessons = courseLessons.length;
        const completedLessons = lessonProgress.filter(p => courseLessons.includes(p.lessonId) && p.isCompleted).length;

        let progressPercentage = 0;
        if (totalLessons > 0) {
            progressPercentage = Math.round((completedLessons / totalLessons) * 100);
        }

        let status: 'COMPLETED' | 'IN_PROGRESS' | 'NOT_STARTED' = 'NOT_STARTED';
        if (progressPercentage === 100) {
            status = 'COMPLETED';
        } else if (progressPercentage > 0) {
            status = 'IN_PROGRESS';
            inProgressCount++;
        }

        return {
            course: {
                id: enrollment.course.id,
                slug: enrollment.course.slug,
                thumbnailFileName: enrollment.course.thumbnailFileName,
                title: enrollment.course.title
            },
            progressPercentage,
            status
        };
    });
    const enrolledCourseIds = new Set(enrollments.map(e => e.courseId));
    return { coursesWithProgress, enrolledCourseIds, inProgressCount };
});

/** Greeting data for the learner dashboard hero. */
export async function loadLearnerHero() {
    const sessionUser = await getAuthenticatedUser();
    const [user, { inProgressCount }] = await Promise.all([
        prismaClient.user.findUnique({ select: { firstName: true }, where: { id: sessionUser.id } }),
        loadEnrollmentProgress(sessionUser.id)
    ]);
    if (!user) destination('/sign-in' as Route);
    return { firstName: user.firstName, inProgressCount };
}

/** Organization memberships for the My Workspaces section. */
export async function loadLearnerWorkspaces() {
    const sessionUser = await getAuthenticatedUser();
    return prismaClient.member.findMany({
        select: { role: true, organization: { select: { id: true, name: true, slug: true } } },
        where: { userId: sessionUser.id }
    });
}

/** Enrolled courses with progress for the My Learning section. */
export async function loadLearnerCourses() {
    const sessionUser = await getAuthenticatedUser();
    const { coursesWithProgress } = await loadEnrollmentProgress(sessionUser.id);
    return coursesWithProgress;
}

/** Published courses the learner isn't enrolled in, for the Trending Courses section. */
export async function loadLearnerRecommendations() {
    const sessionUser = await getAuthenticatedUser();
    const [{ enrolledCourseIds }, publishedCourses] = await Promise.all([
        loadEnrollmentProgress(sessionUser.id),
        getPublishedCourses(prismaClient)
    ]);
    return publishedCourses
        .filter(c => !enrolledCourseIds.has(c.id))
        .map(c => ({
            category: c.category,
            id: c.id,
            level: c.level,
            price: c.price,
            shortDescription: c.shortDescription,
            thumbnailFileName: c.thumbnailFileName,
            title: c.title
        }));
}
