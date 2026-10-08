import 'server-only';

/** @internal Repository API; application callers use authorized feature DALs. */
import type { Prisma } from '@prisma/client';
import type { z } from 'zod';

import { QuestionType } from '@prisma/client';

import type { submitQuizSchema } from '@/features/quiz/schemas';
import type { PrismaLike } from '@/features/quiz/server/repositories/types';

type SubmitQuizAnswersInput = z.infer<typeof submitQuizSchema>;

import type { QuestionResult, SubmitQuizResult } from '@/features/quiz/submission-types';
export type { QuestionResult, SubmitQuizResult } from '@/features/quiz/submission-types';

type QuizWithQuestionsAndOptions = Prisma.QuizGetPayload<{
    include: {
        questions: {
            include: {
                options: true;
            };
        };
    };
}>;

export async function submitQuizAnswers(
    prisma: PrismaLike,
    data: SubmitQuizAnswersInput,
    userId: string,
    organizationId: string | null
): Promise<SubmitQuizResult> {
    const quiz = (await prisma.quiz.findUnique({
        include: {
            questions: {
                include: {
                    options: true
                }
            }
        },
        where: { id: data.quizId }
    })) as QuizWithQuestionsAndOptions | null;

    if (quiz && organizationId === null && (quiz.visibility !== 'PUBLIC' || quiz.organizationId != null))
        throw new Error('Quiz not found');
    if (quiz && organizationId !== null && quiz.organizationId !== organizationId) throw new Error('Quiz not found');
    if (!quiz) {
        throw new Error('Quiz not found');
    }
    if (quiz.visibility !== 'PUBLIC' && quiz.userId !== userId) throw new Error('Quiz not found');
    if (organizationId && quiz.courseId) {
        const enrollment = await prisma.enrollment.findUnique({
            where: { userId_courseId: { userId, courseId: quiz.courseId } },
            select: { id: true }
        });
        if (!enrollment) throw new Error('Enrollment required');
    }

    if (quiz.allowedAttempts !== null) {
        const attemptCount = await prisma.quizSubmission.count({
            where: { quizId: quiz.id, userId }
        });
        if (attemptCount >= quiz.allowedAttempts) {
            throw new Error('You have used all allowed attempts for this quiz.');
        }
    }

    let score = 0;
    const total = quiz.questions.length;
    const results: QuestionResult[] = [];

    // Grade the submission
    for (const submitted of data.answers) {
        const question = quiz.questions.find(q => q.id === submitted.questionId);
        if (!question) continue;

        let isCorrect = false;
        const correctOptionIds = question.options.filter(o => o.isCorrect).map(o => o.id);
        const correctTexts = question.options.filter(o => o.isCorrect).map(o => o.content);

        if (question.type === QuestionType.SINGLE_CHOICE || question.type === QuestionType.MULTIPLE_CHOICE) {
            const submittedOptionIds = Array.isArray(submitted.answer) ? submitted.answer : [submitted.answer];

            // Check if arrays hold the exact same elements
            if (
                submittedOptionIds.length === correctOptionIds.length &&
                submittedOptionIds.every((id: string) => correctOptionIds.includes(id))
            ) {
                isCorrect = true;
            }
        } else if (question.type === QuestionType.CUSTOM_INPUT) {
            // For custom input, we assume the valid answers are stored in the options' "content" field
            const givenAnswer = Array.isArray(submitted.answer) ? submitted.answer[0] : submitted.answer;
            const validAnswers = question.options.map(o => o.content.toLowerCase().trim());

            if (givenAnswer && validAnswers.includes(givenAnswer.toLowerCase().trim())) {
                isCorrect = true;
            }
        }

        if (isCorrect) score++;

        results.push({
            correct: isCorrect,
            correctOptionIds: quiz.showCorrectAnswers === false ? [] : correctOptionIds,
            correctTexts: quiz.showCorrectAnswers === false ? [] : correctTexts,
            explanation: quiz.showCorrectAnswers === false ? null : question.explanation,
            prompt: question.prompt,
            questionId: question.id,
            submittedAnswer: submitted.answer
        });
    }

    await prisma.quizSubmission.create({
        data: {
            organizationId,
            quizId: quiz.id,
            score,
            userId
        }
    });

    const passed = quiz.passingScore !== null ? (score / total) * 100 >= quiz.passingScore : undefined;

    return {
        ...(passed !== undefined && { passed }),
        results,
        score,
        total
    };
}
