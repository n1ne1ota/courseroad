import 'server-only';

import { z } from 'zod';

import { getOrganizationContext } from '@/server/auth/organization-context';
import { AccessError, getAuthenticatedUser } from '@/server/auth/session';
import { prismaClient } from '@/server/db/client';

/** Authorize course content independently of layouts and mutable session preferences. */
export async function requireCourseAccess(
    courseId: string,
    mode: 'learn' | 'edit' | 'enroll' = 'learn',
    slug?: string
) {
    const id = z.uuid().parse(courseId);
    const user = await getAuthenticatedUser();
    const course = await prismaClient.course.findUnique({
        where: { id },
        select: { id: true, organizationId: true, userId: true, status: true, price: true }
    });
    if (!course) throw new AccessError('Course not found', 404);
    let organizationSlug: string | null = null;
    if (course.organizationId) {
        const organization = await prismaClient.organization.findUnique({
            where: { id: course.organizationId },
            select: { slug: true }
        });
        if (!organization || (slug && slug !== organization.slug)) throw new AccessError('Course not found', 404);
        organizationSlug = organization.slug;
        const context = await getOrganizationContext(organization.slug, mode === 'edit' ? 'creator' : 'learner');
        if (mode === 'edit' && course.userId !== user.id && !['owner', 'manager'].includes(context.member.role))
            throw new AccessError('Course not found', 404);
    } else if (slug) {
        throw new AccessError('Course not found', 404);
    } else if (mode === 'edit' && course.userId !== user.id) {
        throw new AccessError('Course not found', 404);
    }
    const enrollment = await prismaClient.enrollment.findUnique({
        where: { userId_courseId: { userId: user.id, courseId: id } },
        select: { id: true }
    });
    if (mode === 'learn' && !enrollment) throw new AccessError('Enrollment required');
    if (mode === 'enroll' && (course.status !== 'Published' || ((course.price ?? 0) > 0 && !enrollment)))
        throw new AccessError('Course cannot be enrolled for free');
    return { user, course, organizationSlug };
}

/** A lesson must belong to the authorized course, including on direct action calls. */
export async function requireLessonAccess(courseId: string, lessonId: string, slug?: string) {
    const access = await requireCourseAccess(courseId, 'learn', slug);
    const lesson = await prismaClient.lesson.findUnique({
        where: { id: z.uuid().parse(lessonId) },
        select: { id: true, module: { select: { courseId: true } } }
    });
    if (!lesson || lesson.module.courseId !== courseId) throw new AccessError('Lesson not found', 404);
    return access;
}
