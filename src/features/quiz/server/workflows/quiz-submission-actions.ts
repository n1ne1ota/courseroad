import 'server-only';

import { revalidatePath } from 'next/cache';

import { submitQuizSchema } from '@/features/quiz/schemas';
import { submitQuizAnswers as submitQuizAnswersMutation } from '@/features/quiz/server/repositories/mutations/index';
import { createAuthFormAction } from '@/server/actions/create-auth-action';
import { createTenantFormAction } from '@/server/actions/create-tenant-action';
import { prismaClient } from '@/server/db/client';
import { getTenantPrisma } from '@/server/db/get-tenant-prisma';

import type { QuestionResult, SubmitQuizResult } from '@/features/quiz/server/repositories/mutations/index';

export type { QuestionResult, SubmitQuizResult };

export const submitQuizAnswers = createTenantFormAction(
    'learner',
    submitQuizSchema,
    async (data, ctx): Promise<SubmitQuizResult> => {
        const prisma = await getTenantPrisma();

        const result = await submitQuizAnswersMutation(prisma, data, ctx.user.id, ctx.organizationId);

        revalidatePath(`/organization/${ctx.organizationSlug}/${ctx.member.role}/dashboard/quizzes`);

        return result;
    }
);

/**
 * Submit answers for a public, org-less quiz (e.g. the `/try-quiz` demo).
 *
 * Uses {@link createAuthFormAction} so it works for any signed-in user —
 * including anonymous guest sessions — without requiring org membership. The
 * resulting `QuizSubmission` is written with `organizationId: null`.
 */
export const submitPublicQuizAnswers = createAuthFormAction(
    submitQuizSchema,
    async (data, ctx): Promise<SubmitQuizResult> => {
        return submitQuizAnswersMutation(prismaClient, data, ctx.user.id, null);
    }
);
