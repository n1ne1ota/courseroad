import 'server-only';

import type { Route } from 'next';

import { type CompletedCourse } from '@/features/course/certificate-types';
import {
    getLearnerEnrollmentsWithProgressDetails,
    getUserLessonProgress
} from '@/features/course/server/repositories/queries/get-enrollments';
import { destination } from '@/server/auth/read-errors';
import { getAuthenticatedUser } from '@/server/auth/session';
import { prismaClient } from '@/server/db/client';

/** Authorized course projection for CertificatesContent. */
export async function loadCertificatesContent() {
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
    const [enrollments, lessonProgress] = await Promise.all([
        getLearnerEnrollmentsWithProgressDetails(prismaClient, sessionUser.id),
        getUserLessonProgress(prismaClient, sessionUser.id)
    ]);
    const learnerName = user.name || `${user.firstName || 'Learner'} ${user.lastName || ''}`.trim();
    const completedCourses: CompletedCourse[] = [];
    for (const enrollment of enrollments) {
        const courseLessons = enrollment.course.modules.flatMap(m => m.lessons.map(l => l.id));
        const totalLessons = courseLessons.length;

        if (totalLessons === 0) continue;

        const completedProgressRecords = lessonProgress.filter(
            p => courseLessons.includes(p.lessonId) && p.isCompleted
        );
        const completedLessons = completedProgressRecords.length;

        if (completedLessons === totalLessons) {
            // Find the latest completedAt timestamp as the course completion date
            let completedAtDate: Date | null = null;
            completedProgressRecords.forEach(r => {
                if (r.completedAt) {
                    const d = new Date(r.completedAt);
                    if (!completedAtDate || d > completedAtDate) {
                        completedAtDate = d;
                    }
                }
            });

            completedCourses.push({
                completedAt: completedAtDate || enrollment.updatedAt || new Date(),
                id: enrollment.id,
                learnerName,
                title: enrollment.course.title
            });
        }
    }
    return { completedCourses };
}
