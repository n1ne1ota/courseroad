'use server';

import * as workflows from '@/features/analytics/server/workflows/actions';

/** Mutation transport adapter; validation and authorization are owned by the DAL. */

/** Mutation transport adapter; validation and authorization are owned by the DAL. */
export async function identifyDevice(
    ...args: Parameters<typeof workflows.identifyDevice>
): ReturnType<typeof workflows.identifyDevice> {
    return workflows.identifyDevice(...args);
}
