import 'server-only';

import type { Route } from 'next';

import type { Lesson, Module, UserLessonProgress } from '@prisma/client';

import { requireCourseAccess } from '@/features/course/server/access';
import {
    getCourseWithCurriculum,
    getLessonProgress
} from '@/features/course/server/repositories/queries/get-curriculum';
import { getEnrollment } from '@/features/course/server/repositories/queries/get-enrollments';
import { destination, missingResource } from '@/server/auth/read-errors';
import { getAuthenticatedUser } from '@/server/auth/session';
import { prismaClient } from '@/server/db/client';
type LearnLayoutProps = {
    params: Promise<{ courseId: string }>;
};
/** Authorized course projection for B2CLearnLayout. */
export async function loadB2CLearnLayout(props: LearnLayoutProps) {
    const params = await props.params;
    const { courseId } = params;
    const user = await getAuthenticatedUser();
    await requireCourseAccess(courseId, 'learn', undefined);
    const enrollment = await getEnrollment(prismaClient, user.id, courseId);
    if (!enrollment) destination(`/courses/${courseId}` as Route);
    const course = await getCourseWithCurriculum(prismaClient, courseId);
    if (!course) missingResource();
    const allLessonIds = course.modules.flatMap((m: Module & { lessons: Lesson[] }) =>
        m.lessons.map((l: Lesson) => l.id)
    );
    const progress = await getLessonProgress(prismaClient, user.id, allLessonIds);
    const completedLessonIds = new Set(
        progress.filter((p: UserLessonProgress) => p.isCompleted).map((p: UserLessonProgress) => p.lessonId)
    );
    return { course, completedLessonIds };
}
