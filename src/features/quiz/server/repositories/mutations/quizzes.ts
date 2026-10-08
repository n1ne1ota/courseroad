import 'server-only';

/** @internal Repository API; application callers use authorized feature DALs. */
import type { z } from 'zod';

import { sanitizeHtml } from '@/lib/utils/sanitize';

import type { createQuizSchema, updateQuizSchema } from '@/features/quiz/schemas';
import type { PrismaLike } from '@/features/quiz/server/repositories/types';

type CreateQuizInput = z.infer<typeof createQuizSchema>;
type UpdateQuizInput = z.infer<typeof updateQuizSchema>;

export async function createQuiz(
    prisma: PrismaLike,
    data: CreateQuizInput & { organizationId: string; userId: string }
) {
    return prisma.quiz.create({
        data: {
            courseId: data.courseId ?? null,
            description: data.description ? sanitizeHtml(data.description) : null,
            lessonId: data.lessonId ?? null,
            organizationId: data.organizationId,
            title: data.title,
            userId: data.userId
        }
    });
}

export async function updateQuiz(prisma: PrismaLike, data: UpdateQuizInput, userId: string, memberRole: string) {
    const existingQuiz = await prisma.quiz.findUnique({
        where: { id: data.id }
    });

    if (!existingQuiz) {
        throw new Error('Quiz not found');
    }

    if (existingQuiz.userId !== userId && memberRole !== 'manager' && memberRole !== 'owner') {
        throw new Error('Unauthorized: you do not own this quiz');
    }

    return prisma.quiz.update({
        data: {
            ...(data.allowedAttempts !== undefined && {
                allowedAttempts: data.allowedAttempts
            }),
            ...(data.description !== undefined && {
                description: data.description ? sanitizeHtml(data.description) : data.description
            }),
            ...(data.passingScore !== undefined && { passingScore: data.passingScore }),
            ...(data.showCorrectAnswers !== undefined && {
                showCorrectAnswers: data.showCorrectAnswers
            }),
            ...(data.showTimer !== undefined && {
                showTimer: data.showTimer
            }),
            ...(data.shuffleQuestions !== undefined && {
                shuffleQuestions: data.shuffleQuestions
            }),
            ...(data.thumbnailUrl !== undefined && { thumbnailUrl: data.thumbnailUrl }),
            ...(data.timeLimit !== undefined && { timeLimit: data.timeLimit }),
            ...(data.title !== undefined && { title: data.title }),
            ...(data.visibility !== undefined && { visibility: data.visibility })
        },
        where: { id: data.id }
    });
}

export async function deleteQuiz(prisma: PrismaLike, quizId: string, userId: string, memberRole: string) {
    const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });

    if (!quiz) {
        throw new Error('Quiz not found');
    }

    if (quiz.userId !== userId && memberRole !== 'manager' && memberRole !== 'owner') {
        throw new Error('Unauthorized: you do not own this quiz');
    }

    await prisma.quiz.delete({ where: { id: quizId } });
    return true;
}
