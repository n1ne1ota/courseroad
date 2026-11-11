'use server';

import * as workflows from '@/features/course/server/workflows/module-actions';

/** Mutation transport adapter; validation and authorization are owned by the DAL. */
export async function createModule(
    ...args: Parameters<typeof workflows.createModule>
): ReturnType<typeof workflows.createModule> {
    return workflows.createModule(...args);
}

/** Mutation transport adapter; validation and authorization are owned by the DAL. */
export async function updateModule(
    ...args: Parameters<typeof workflows.updateModule>
): ReturnType<typeof workflows.updateModule> {
    return workflows.updateModule(...args);
}

/** Mutation transport adapter; validation and authorization are owned by the DAL. */
export async function deleteModule(
    ...args: Parameters<typeof workflows.deleteModule>
): ReturnType<typeof workflows.deleteModule> {
    return workflows.deleteModule(...args);
}

/** Mutation transport adapter; validation and authorization are owned by the DAL. */
export async function reorderModules(
    ...args: Parameters<typeof workflows.reorderModules>
): ReturnType<typeof workflows.reorderModules> {
    return workflows.reorderModules(...args);
}
