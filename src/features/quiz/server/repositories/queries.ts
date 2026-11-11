import 'server-only';

/** @internal Repository API; application callers use authorized feature DALs. */
import type { PrismaLike } from '@/features/quiz/server/repositories/types';

/**
 * Fetch a quiz with its full question tree (questions + options).
 * Used in the teacher quiz editor.
 */
export async function getQuizWithQuestions(prisma: PrismaLike, quizId: string) {
    return prisma.quiz.findUnique({
        include: {
            questions: {
                include: { options: true },
                orderBy: { order: 'asc' as const }
            }
        },
        where: { id: quizId }
    });
}

/**
 * Fetch a quiz for learner play — hides correct answer flags from options.
 * Only returns PUBLIC quizzes or quizzes owned by the requesting user.
 */
export async function getQuizForLearner(prisma: PrismaLike, quizId: string, userId: string) {
    const quiz = await prisma.quiz.findUnique({
        select: {
            id: true,
            title: true,
            description: true,
            thumbnailUrl: true,
            courseId: true,
            lessonId: true,
            visibility: true,
            timeLimit: true,
            allowedAttempts: true,
            passingScore: true,
            shuffleQuestions: true,
            showCorrectAnswers: true,
            showTimer: true,
            createdAt: true,
            updatedAt: true,
            userId: true,
            organizationId: true,
            questions: {
                select: {
                    id: true,
                    title: true,
                    imageUrl: true,
                    codeLanguage: true,
                    prompt: true,
                    type: true,
                    order: true,
                    options: {
                        select: {
                            content: true,
                            id: true,
                            order: true
                        }
                    }
                },
                orderBy: { order: 'asc' as const }
            }
        },
        where: {
            id: quizId,
            ...(userId ? {} : { organizationId: null }),
            OR: [{ visibility: 'PUBLIC' }, { userId }]
        }
    });
    return quiz
        ? {
              ...quiz,
              questions: quiz.questions.map(question => ({
                  ...question,
                  explanation: null,
                  options: question.type === 'CUSTOM_INPUT' ? [] : question.options
              }))
          }
        : null;
}

/**
 * Count submission attempts for a user on a specific quiz.
 */
export async function getQuizAttemptCount(prisma: PrismaLike, quizId: string, userId: string) {
    return prisma.quizSubmission.count({
        where: { quizId, userId }
    });
}

/**
 * Fetch all quizzes for a specific user (teacher dashboard).
 */
export async function getQuizzesByUserId(prisma: PrismaLike, userId: string) {
    return prisma.quiz.findMany({
        include: {
            _count: { select: { questions: true, submissions: true } }
        },
        orderBy: { createdAt: 'desc' as const },
        where: { userId }
    });
}
