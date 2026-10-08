import 'server-only';

import { revalidatePath } from 'next/cache';

import {
    createLessonSchema,
    deleteLessonSchema,
    reorderLessonsSchema,
    updateLessonSchema
} from '@/features/course/lesson-schemas';
import {
    createLesson as createLessonMutation,
    deleteLesson as deleteLessonMutation,
    reorderLessons as reorderLessonsMutation,
    updateLesson as updateLessonMutation
} from '@/features/course/server/repositories/mutations/lessons';
import { createTenantAction } from '@/server/actions/create-tenant-action';
import { getTenantPrisma } from '@/server/db/get-tenant-prisma';

export const createLesson = createTenantAction('creator', createLessonSchema, async (data, ctx) => {
    const prisma = await getTenantPrisma();

    const lesson = await createLessonMutation(prisma, data, ctx.user.id, ctx.member.role, ctx.organizationId);

    const courseModule = await prisma.module.findUnique({
        select: { courseId: true },
        where: { id: data.moduleId }
    });
    if (courseModule) {
        revalidatePath(
            `/organization/${ctx.organizationSlug}/${ctx.member.role}/dashboard/courses/${courseModule.courseId}`
        );
    }
    return lesson;
});

export const updateLesson = createTenantAction('creator', updateLessonSchema, async (data, ctx) => {
    const prisma = await getTenantPrisma();

    const updatedLesson = await updateLessonMutation(prisma, data, ctx.user.id, ctx.member.role);

    const lesson = await prisma.lesson.findUnique({
        include: { module: true },
        where: { id: data.lessonId }
    });
    if (lesson) {
        revalidatePath(
            `/organization/${ctx.organizationSlug}/${ctx.member.role}/dashboard/courses/${lesson.module.courseId}`
        );
    }
    return updatedLesson;
});

export const deleteLesson = createTenantAction('creator', deleteLessonSchema, async (data, ctx) => {
    const prisma = await getTenantPrisma();

    const courseId = await deleteLessonMutation(prisma, data, ctx.user.id, ctx.member.role);

    revalidatePath(`/organization/${ctx.organizationSlug}/${ctx.member.role}/dashboard/courses/${courseId}`);
    return true;
});

export const reorderLessons = createTenantAction('creator', reorderLessonsSchema, async (data, ctx) => {
    const prisma = await getTenantPrisma();

    const courseId = await reorderLessonsMutation(prisma, data, ctx.user.id, ctx.member.role);

    if (courseId) {
        revalidatePath(`/organization/${ctx.organizationSlug}/${ctx.member.role}/dashboard/courses/${courseId}`);
    }
    return true;
});
