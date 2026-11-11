import 'server-only';

import type { Route } from 'next';

import { getPublishedCourses } from '@/features/course/server/repositories/queries/get-courses';
import {
    getLearnerEnrollmentsWithProgressDetails,
    getUserLessonProgress
} from '@/features/course/server/repositories/queries/get-enrollments';
import { destination } from '@/server/auth/read-errors';
import { getAuthenticatedUser } from '@/server/auth/session';
import { prismaClient } from '@/server/db/client';

/** Authorized course projection for LearnerDashboardContent. */
export async function loadLearnerDashboardContent() {
    const sessionUser = await getAuthenticatedUser();
    const user = await prismaClient.user.findUnique({
        select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            email: true,
            image: true,
            username: true,
            role: true
        },
        where: { id: sessionUser.id }
    });
    if (!user) destination('/sign-in' as Route);
    const [enrollments, lessonProgress, publishedCourses, memberships] = await Promise.all([
        getLearnerEnrollmentsWithProgressDetails(prismaClient, sessionUser.id),
        getUserLessonProgress(prismaClient, sessionUser.id),
        getPublishedCourses(prismaClient),
        prismaClient.member.findMany({
            select: { role: true, organization: { select: { id: true, name: true, slug: true } } },
            where: { userId: sessionUser.id }
        })
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
    const catalogRecommendations = publishedCourses
        .filter(c => !enrollments.some(e => e.courseId === c.id))
        .map(c => ({
            category: c.category,
            id: c.id,
            level: c.level,
            price: c.price,
            shortDescription: c.shortDescription,
            thumbnailFileName: c.thumbnailFileName,
            title: c.title
        }));
    return { user, memberships, inProgressCount, coursesWithProgress, catalogRecommendations };
}
