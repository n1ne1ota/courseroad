import 'server-only';

import { revalidatePath } from 'next/cache';

import { insertQuizQuestionsSchema } from '@/features/quiz/schemas';
import { saveQuizQuestions as saveQuizQuestionsMutation } from '@/features/quiz/server/repositories/mutations/index';
import { createTenantFormAction } from '@/server/actions/create-tenant-action';
import { getTenantPrisma } from '@/server/db/get-tenant-prisma';

export const saveQuizQuestions = createTenantFormAction('creator', insertQuizQuestionsSchema, async (data, ctx) => {
    const prisma = await getTenantPrisma();

    await saveQuizQuestionsMutation(prisma, data, ctx.user.id, ctx.member.role);

    revalidatePath(`/organization/${ctx.organizationSlug}/${ctx.member.role}/dashboard/quizzes/${data.quizId}`);

    return true;
});
