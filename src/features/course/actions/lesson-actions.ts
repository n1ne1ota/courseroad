'use server';

import * as workflows from '@/features/course/server/workflows/lesson-actions';

/** Mutation transport adapter; validation and authorization are owned by the DAL. */
export async function createLesson(
    ...args: Parameters<typeof workflows.createLesson>
): ReturnType<typeof workflows.createLesson> {
    return workflows.createLesson(...args);
}

/** Mutation transport adapter; validation and authorization are owned by the DAL. */
export async function updateLesson(
    ...args: Parameters<typeof workflows.updateLesson>
): ReturnType<typeof workflows.updateLesson> {
    return workflows.updateLesson(...args);
}

/** Mutation transport adapter; validation and authorization are owned by the DAL. */
export async function deleteLesson(
    ...args: Parameters<typeof workflows.deleteLesson>
): ReturnType<typeof workflows.deleteLesson> {
    return workflows.deleteLesson(...args);
}

/** Mutation transport adapter; validation and authorization are owned by the DAL. */
export async function reorderLessons(
    ...args: Parameters<typeof workflows.reorderLessons>
): ReturnType<typeof workflows.reorderLessons> {
    return workflows.reorderLessons(...args);
}
