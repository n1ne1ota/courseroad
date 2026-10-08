import 'server-only';

import type { Route } from 'next';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { z } from 'zod';

import { createQuizSchema, updateQuizSchema } from '@/features/quiz/schemas';
import {
    createQuiz as createQuizMutation,
    deleteQuiz as deleteQuizMutation,
    updateQuiz as updateQuizMutation
} from '@/features/quiz/server/repositories/mutations/index';
import { createTenantAction, createTenantFormAction } from '@/server/actions/create-tenant-action';
import { getTenantPrisma } from '@/server/db/get-tenant-prisma';

export const createQuiz = createTenantFormAction('creator', createQuizSchema, async (data, ctx) => {
    const prisma = await getTenantPrisma();

    if (data.courseId) {
        const course = await prisma.course.findUnique({
            where: { id: data.courseId },
            select: { id: true, userId: true }
        });
        if (!course || (course.userId !== ctx.user.id && !['owner', 'manager'].includes(ctx.member.role)))
            throw new Error('Course not found');
    }
    if (data.lessonId) {
        const lesson = await prisma.lesson.findUnique({
            where: { id: data.lessonId },
            select: { module: { select: { courseId: true, course: { select: { userId: true } } } } }
        });
        if (
            !lesson ||
            (data.courseId && lesson.module.courseId !== data.courseId) ||
            (lesson.module.course.userId !== ctx.user.id && !['owner', 'manager'].includes(ctx.member.role))
        )
            throw new Error('Lesson not found');
    }
    const quiz = await createQuizMutation(prisma, {
        ...data,
        organizationId: ctx.organizationId,
        userId: ctx.user.id
    });

    revalidatePath(`/organization/${ctx.organizationSlug}/${ctx.member.role}/dashboard/quizzes`);

    // This will throw a redirect error which is correctly caught and rethrown by safe-action
    redirect(`/organization/${ctx.organizationSlug}/${ctx.member.role}/dashboard/quizzes/${quiz.id}` as Route);
});

export const updateQuiz = createTenantFormAction('creator', updateQuizSchema, async (data, ctx) => {
    const prisma = await getTenantPrisma();

    const updatedQuiz = await updateQuizMutation(prisma, data, ctx.user.id, ctx.member.role);

    revalidatePath(`/organization/${ctx.organizationSlug}/${ctx.member.role}/dashboard/quizzes/${data.id}`);
    revalidatePath(`/organization/${ctx.organizationSlug}/${ctx.member.role}/dashboard/quizzes`);

    return updatedQuiz;
});

export const deleteQuiz = createTenantAction(
    'creator',
    z.object({
        quizId: z.uuid()
    }),
    async (data, ctx) => {
        const prisma = await getTenantPrisma();

        await deleteQuizMutation(prisma, data.quizId, ctx.user.id, ctx.member.role);

        revalidatePath(`/organization/${ctx.organizationSlug}/${ctx.member.role}/dashboard/quizzes`);

        redirect(`/organization/${ctx.organizationSlug}/${ctx.member.role}/dashboard/quizzes` as Route);
    }
);
