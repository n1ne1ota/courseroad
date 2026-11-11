import 'server-only';

import { getQuizForLearner } from '@/features/quiz/server/repositories/queries';
import { missingResource } from '@/server/auth/read-errors';
import { prismaClient } from '@/server/db/client';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** Authorized quiz projection for TryQuizPage. */
export async function loadTryQuizPage(props: { params: Promise<{ quizId: string }> }) {
    const { quizId } = await props.params;
    if (!UUID_REGEX.test(quizId)) missingResource();
    const quiz = await getQuizForLearner(prismaClient, quizId, '');
    if (!quiz) missingResource();
    return { quiz };
}
