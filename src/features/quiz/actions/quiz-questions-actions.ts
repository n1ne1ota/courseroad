'use server';

import * as workflows from '@/features/quiz/server/workflows/quiz-questions-actions';

/** Mutation transport adapter; validation and authorization are owned by the DAL. */
export async function saveQuizQuestions(
    ...args: Parameters<typeof workflows.saveQuizQuestions>
): ReturnType<typeof workflows.saveQuizQuestions> {
    return workflows.saveQuizQuestions(...args);
}
