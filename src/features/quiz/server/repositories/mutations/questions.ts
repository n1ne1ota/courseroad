import 'server-only';

/** @internal Repository API; application callers use authorized feature DALs. */
import type { z } from 'zod';

import { randomUUID } from 'node:crypto';

import { QuestionType } from '@prisma/client';

import { sanitizeHtml } from '@/lib/utils/sanitize';

import type { insertQuizQuestionsSchema } from '@/features/quiz/schemas';
import type { PrismaLike } from '@/features/quiz/server/repositories/types';

type InsertQuizQuestionsInput = z.infer<typeof insertQuizQuestionsSchema>;

export async function saveQuizQuestions(
    prisma: PrismaLike,
    data: InsertQuizQuestionsInput,
    userId: string,
    memberRole: string
) {
    const quiz = await prisma.quiz.findUnique({
        where: { id: data.quizId }
    });

    if (!quiz) {
        throw new Error('Quiz not found');
    }

    if (quiz.userId !== userId && memberRole !== 'manager' && memberRole !== 'owner') {
        throw new Error('Unauthorized: you do not own this quiz');
    }

    // Upsert strategy: diff existing records against incoming data,
    // delete removed items, upsert the rest to preserve stable IDs.
    await prisma.$transaction(async (tx: Omit<PrismaLike, '$transaction'>) => {
        // Fetch existing questions and their option IDs for diffing
        const existingQuestions = (await tx.quizQuestion.findMany({
            select: {
                id: true,
                options: { select: { id: true } }
            },
            where: { quizId: data.quizId }
        })) as { id: string; options: { id: string }[] }[];

        const existingQuestionIds = new Set(existingQuestions.map(q => q.id));
        const incomingQuestionIds = new Set(data.questions.filter(q => q.id).map(q => q.id as string));

        // Delete questions that were removed by the user
        const questionIdsToDelete = [...existingQuestionIds].filter(id => !incomingQuestionIds.has(id));
        if (questionIdsToDelete.length > 0) {
            await tx.quizQuestion.deleteMany({
                where: { id: { in: questionIdsToDelete } }
            });
        }

        // Upsert each question and its options
        for (let i = 0; i < data.questions.length; i++) {
            const q = data.questions[i];

            if (!q) continue;

            const questionId = q.id ?? randomUUID();
            const questionData = {
                codeLanguage: q.codeLanguage ?? null,
                explanation: q.explanation ? sanitizeHtml(q.explanation) : null,
                imageUrl: q.imageUrl ?? null,
                order: q.order !== undefined ? q.order : i,
                prompt: sanitizeHtml(q.prompt),
                title: q.title ?? null,
                type: q.type
            };

            await tx.quizQuestion.upsert({
                create: {
                    ...questionData,
                    id: questionId,
                    organizationId: quiz.organizationId,
                    quizId: data.quizId
                },
                update: questionData,
                where: { id: questionId, quizId: data.quizId }
            });

            // Handle options for this question
            if (
                q.options &&
                q.options.length > 0 &&
                (q.type === QuestionType.SINGLE_CHOICE ||
                    q.type === QuestionType.MULTIPLE_CHOICE ||
                    q.type === QuestionType.CUSTOM_INPUT)
            ) {
                // Find existing option IDs for this question
                const existingQuestion = existingQuestions.find(eq => eq.id === questionId);
                const existingOptionIds = new Set(existingQuestion?.options.map(o => o.id) ?? []);
                const incomingOptionIds = new Set(q.options.filter(o => o.id).map(o => o.id as string));

                // Delete removed options
                const optionIdsToDelete = [...existingOptionIds].filter(id => !incomingOptionIds.has(id));

                if (optionIdsToDelete.length > 0) {
                    await tx.quizOption.deleteMany({
                        where: { id: { in: optionIdsToDelete } }
                    });
                }

                // Upsert each option
                for (let optIdx = 0; optIdx < q.options.length; optIdx++) {
                    const opt = q.options[optIdx];

                    if (!opt) continue;

                    const optionId = opt.id ?? randomUUID();
                    const optionData = {
                        content: opt.content,
                        isCorrect: opt.isCorrect,
                        order: opt.order !== undefined ? opt.order : optIdx
                    };

                    await tx.quizOption.upsert({
                        create: { ...optionData, id: optionId, organizationId: quiz.organizationId, questionId },
                        update: optionData,
                        where: { id: optionId, questionId }
                    });
                }
            } else {
                // No valid options, remove any existing options for this question
                await tx.quizOption.deleteMany({
                    where: { questionId }
                });
            }
        }
    });

    return true;
}
