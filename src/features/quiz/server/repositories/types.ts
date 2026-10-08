import 'server-only';
/** @internal Repository API; application callers use authorized feature DALs. */
/**
 * Shared types for the quizzes domain module.
 */

import type { Prisma } from '@prisma/client';

/**
 * Structural type that accepts both the base PrismaClient and
 * tenant-scoped extended clients (DynamicClientExtensionThis).
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export type PrismaLike = {
    enrollment: Prisma.EnrollmentDelegate<any>;
    quiz: Prisma.QuizDelegate<any>;
    quizSubmission: Prisma.QuizSubmissionDelegate<any>;
    quizQuestion: Prisma.QuizQuestionDelegate<any>;
    quizOption: Prisma.QuizOptionDelegate<any>;
    $transaction: {
        <T>(promises: Array<any>): Promise<T[]>;
        <T>(fn: (tx: any) => Promise<T>): Promise<T>;
    };
};
/* eslint-enable @typescript-eslint/no-explicit-any */
