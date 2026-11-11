'use server';

import * as workflows from '@/features/course/server/workflows/learning-actions';

/** Mutation transport adapter; validation and authorization are owned by the DAL. */
export async function enrollInCourse(
    ...args: Parameters<typeof workflows.enrollInCourse>
): ReturnType<typeof workflows.enrollInCourse> {
    return workflows.enrollInCourse(...args);
}

/** Mutation transport adapter; validation and authorization are owned by the DAL. */
export async function markLessonComplete(
    ...args: Parameters<typeof workflows.markLessonComplete>
): ReturnType<typeof workflows.markLessonComplete> {
    return workflows.markLessonComplete(...args);
}
