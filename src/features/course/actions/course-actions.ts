'use server';

import * as workflows from '@/features/course/server/workflows/course-actions';
import * as platform from '@/features/course/server/workflows/platform-course-actions';

export async function createPlatformCourse(
    ...args: Parameters<typeof platform.createPlatformCourse>
): ReturnType<typeof platform.createPlatformCourse> {
    return platform.createPlatformCourse(...args);
}

export async function updatePlatformCourse(
    ...args: Parameters<typeof platform.updatePlatformCourse>
): ReturnType<typeof platform.updatePlatformCourse> {
    return platform.updatePlatformCourse(...args);
}

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
