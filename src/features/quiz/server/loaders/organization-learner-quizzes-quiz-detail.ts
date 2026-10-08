import 'server-only';

import { getQuizForLearner } from '@/features/quiz/server/repositories/queries';
import { getOrganizationContext } from '@/server/auth/organization-context';
import { missingResource } from '@/server/auth/read-errors';
import { getAuthenticatedUser } from '@/server/auth/session';
import { getTenantPrisma } from '@/server/db/get-tenant-prisma';

/** Authorized quiz projection for LearnerQuizPlayerFetcher. */
export async function loadLearnerQuizPlayerFetcher({ quizId }: { quizId: string }) {
    await getOrganizationContext(undefined, 'learner');
    const user = await getAuthenticatedUser();
    const prisma = await getTenantPrisma(undefined, 'learner');
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(quizId)) return missingResource();
    const quiz = await getQuizForLearner(prisma, quizId, user.id);
    if (!quiz) return missingResource();
    if (
        quiz.courseId &&
        !(await prisma.enrollment.findUnique({
            where: { userId_courseId: { userId: user.id, courseId: quiz.courseId } },
            select: { id: true }
        }))
    )
        return missingResource();
    let attemptsRemaining: number | null = null;
    if (quiz.allowedAttempts !== null) {
        const count = await prisma.quizSubmission.count({ where: { quizId: quiz.id, userId: user.id } });
        attemptsRemaining = Math.max(0, quiz.allowedAttempts - count);
    }
    return { quiz, attemptsRemaining };
}
