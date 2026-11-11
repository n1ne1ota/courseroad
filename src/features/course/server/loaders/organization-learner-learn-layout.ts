import 'server-only';

import type { Route } from 'next';

import type { Lesson, Module, UserLessonProgress } from '@prisma/client';

import { createOrgRoutes } from '@/lib/routes/org';

import { requireCourseAccess } from '@/features/course/server/access';
import {
    getCourseWithCurriculum,
    getLessonProgress
} from '@/features/course/server/repositories/queries/get-curriculum';
import { getEnrollment } from '@/features/course/server/repositories/queries/get-enrollments';
import { getOrganizationContext } from '@/server/auth/organization-context';
import { destination, missingResource } from '@/server/auth/read-errors';
import { getAuthenticatedUser } from '@/server/auth/session';
import { getTenantPrisma } from '@/server/db/get-tenant-prisma';
type LearnLayoutProps = {
    courseId: string;
    slug: string;
};
/** Authorized course projection for LearnLayout. */
export async function loadLearnLayout({ courseId, slug }: LearnLayoutProps) {
    await getOrganizationContext(slug, 'learner');
    const orgSlug = slug;
    const user = await getAuthenticatedUser();
    await requireCourseAccess(courseId, 'learn', slug);
    const prisma = await getTenantPrisma(slug, 'learner');
    const enrollment = await getEnrollment(prisma, user.id, courseId);
    if (!enrollment) destination(`/courses/${courseId}` as Route);
    const course = await getCourseWithCurriculum(prisma, courseId);
    if (!course) missingResource();
    const allLessonIds = course.modules.flatMap((m: Module & { lessons: Lesson[] }) =>
        m.lessons.map((l: Lesson) => l.id)
    );
    const progress = await getLessonProgress(prisma, user.id, allLessonIds);
    const completedLessonIds = new Set(
        progress.filter((p: UserLessonProgress) => p.isCompleted).map((p: UserLessonProgress) => p.lessonId)
    );
    const orgRoutes = createOrgRoutes(orgSlug, 'learner');
    return { course, completedLessonIds, orgRoutes };
}
