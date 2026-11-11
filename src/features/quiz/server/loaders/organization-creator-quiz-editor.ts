import 'server-only';

import { getQuizWithQuestions } from '@/features/quiz/server/repositories/queries';
import { getOrganizationContext } from '@/server/auth/organization-context';
import { missingResource } from '@/server/auth/read-errors';
import { getAuthenticatedUser } from '@/server/auth/session';
import { AccessError } from '@/server/auth/session';
import { getTenantPrisma } from '@/server/db/get-tenant-prisma';

type CreatorQuizEditViewProps = {
    orgSlug: string;
    quizId: string;
    role: string;
};

/** Authorized quiz projection for CreatorQuizEditorFetcher. */
export async function loadCreatorQuizEditorFetcher({ orgSlug, quizId }: CreatorQuizEditViewProps) {
    await getOrganizationContext(orgSlug, 'creator');

    const user = await getAuthenticatedUser();
    const prisma = await getTenantPrisma(orgSlug, 'creator');
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(quizId)) return missingResource();

    const quiz = await getQuizWithQuestions(prisma, quizId);

    if (!quiz) return missingResource();

    if (quiz && quiz.userId !== user.id) {
        const access = await getOrganizationContext(orgSlug, 'creator');
        if (!['owner', 'manager'].includes(access.member.role)) throw new AccessError('Not found', 404);
    }

    return { quiz };
}
