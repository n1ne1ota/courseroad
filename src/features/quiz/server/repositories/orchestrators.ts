import 'server-only';

/** @internal Repository API; application callers use authorized feature DALs. */
import type { Quiz, QuizSubmission } from '@prisma/client';

import type { PrismaLike } from '@/features/quiz/server/repositories/types';

export type LearnerQuizWithStats = Quiz & {
    questionsCount: number;
    attemptCount: number;
    bestScore: number | null;
    bestPct: number | null;
    lastAttempt: QuizSubmission | null;
    submissions: QuizSubmission[];
    questions: { id: string }[];
};

/**
 * Fetch quizzes for a learner (based on their enrolled course IDs) and compute stats and attempts.
 */
export async function getLearnerQuizzesWithStats(
    prisma: PrismaLike,
    userId: string,
    enrolledCourseIds: string[]
): Promise<LearnerQuizWithStats[]> {
    const quizzes = (await prisma.quiz.findMany({
        include: {
            questions: { select: { id: true } },
            submissions: {
                orderBy: { createdAt: 'desc' as const },
                where: { userId }
            }
        },
        orderBy: { createdAt: 'desc' as const },
        where: {
            OR: [{ courseId: { in: enrolledCourseIds } }, { courseId: null, lessonId: null }],
            visibility: 'PUBLIC'
        }
    })) as (Quiz & {
        questions: { id: string }[];
        submissions: QuizSubmission[];
    })[];

    return quizzes.map(quiz => {
        const totalQuestions = quiz.questions.length;
        const attemptCount = quiz.submissions.length;
        const bestScore = attemptCount > 0 ? Math.max(...quiz.submissions.map(s => s.score)) : null;
        const bestPct =
            bestScore !== null && totalQuestions > 0 ? Math.round((bestScore / totalQuestions) * 100) : null;
        const lastAttempt = quiz.submissions[0] ?? null;

        return {
            ...quiz,
            attemptCount,
            bestPct,
            bestScore,
            lastAttempt,
            questionsCount: totalQuestions
        };
    });
}
