'use server';

import * as workflows from '@/features/auth/server/workflows/admin-actions';

/** Mutation transport adapter; validation and authorization are owned by the DAL. */

/** Mutation transport adapter; validation and authorization are owned by the DAL. */
export async function updateUserRole(
    ...args: Parameters<typeof workflows.updateUserRole>
): ReturnType<typeof workflows.updateUserRole> {
    return workflows.updateUserRole(...args);
}

/** Mutation transport adapter; validation and authorization are owned by the DAL. */
export async function bulkUpdateUserRoles(
    ...args: Parameters<typeof workflows.bulkUpdateUserRoles>
): ReturnType<typeof workflows.bulkUpdateUserRoles> {
    return workflows.bulkUpdateUserRoles(...args);
}

/** Mutation transport adapter; validation and authorization are owned by the DAL. */
export async function bulkDeleteUsers(
    ...args: Parameters<typeof workflows.bulkDeleteUsers>
): ReturnType<typeof workflows.bulkDeleteUsers> {
    return workflows.bulkDeleteUsers(...args);
}
