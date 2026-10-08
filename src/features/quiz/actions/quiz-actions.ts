'use server';

import * as workflows from '@/features/quiz/server/workflows/quiz-actions';

/** Mutation transport adapter; validation and authorization are owned by the DAL. */
export async function createQuiz(
    ...args: Parameters<typeof workflows.createQuiz>
): ReturnType<typeof workflows.createQuiz> {
    return workflows.createQuiz(...args);
}

/** Mutation transport adapter; validation and authorization are owned by the DAL. */
export async function updateQuiz(
    ...args: Parameters<typeof workflows.updateQuiz>
): ReturnType<typeof workflows.updateQuiz> {
    return workflows.updateQuiz(...args);
}

/** Mutation transport adapter; validation and authorization are owned by the DAL. */
export async function deleteQuiz(
    ...args: Parameters<typeof workflows.deleteQuiz>
): ReturnType<typeof workflows.deleteQuiz> {
    return workflows.deleteQuiz(...args);
}
