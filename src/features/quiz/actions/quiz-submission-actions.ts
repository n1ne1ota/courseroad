'use server';

import * as workflows from '@/features/quiz/server/workflows/quiz-submission-actions';

/** Mutation transport adapter; validation and authorization are owned by the DAL. */
export async function submitQuizAnswers(
    ...args: Parameters<typeof workflows.submitQuizAnswers>
): ReturnType<typeof workflows.submitQuizAnswers> {
    return workflows.submitQuizAnswers(...args);
}

/** Mutation transport adapter; validation and authorization are owned by the DAL. */
export async function submitPublicQuizAnswers(
    ...args: Parameters<typeof workflows.submitPublicQuizAnswers>
): ReturnType<typeof workflows.submitPublicQuizAnswers> {
    return workflows.submitPublicQuizAnswers(...args);
}
