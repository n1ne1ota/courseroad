'use server';

import * as workflows from '@/features/course/server/workflows/course-actions';

/** Mutation transport adapter; validation and authorization are owned by the DAL. */
export async function createCourse(
    ...args: Parameters<typeof workflows.createCourse>
): ReturnType<typeof workflows.createCourse> {
    return workflows.createCourse(...args);
}

/** Mutation transport adapter; validation and authorization are owned by the DAL. */
export async function updateCourse(
    ...args: Parameters<typeof workflows.updateCourse>
): ReturnType<typeof workflows.updateCourse> {
    return workflows.updateCourse(...args);
}
