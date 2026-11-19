'use server';

import * as workflows from '@/features/course/server/workflows/curriculum-actions';

/** Mutation transport adapters; scope and resource authorization live in the DAL. */
export async function mutatePlatformCurriculum(
    ...args: Parameters<typeof workflows.mutatePlatformCurriculum>
): ReturnType<typeof workflows.mutatePlatformCurriculum> {
    return workflows.mutatePlatformCurriculum(...args);
}

export async function mutateOrganizationCurriculum(
    ...args: Parameters<typeof workflows.mutateOrganizationCurriculum>
): ReturnType<typeof workflows.mutateOrganizationCurriculum> {
    return workflows.mutateOrganizationCurriculum(...args);
}

export async function syncPlatformVideoStatuses(
    ...args: Parameters<typeof workflows.syncPlatformVideoStatuses>
): ReturnType<typeof workflows.syncPlatformVideoStatuses> {
    return workflows.syncPlatformVideoStatuses(...args);
}

export async function syncOrganizationVideoStatuses(
    ...args: Parameters<typeof workflows.syncOrganizationVideoStatuses>
): ReturnType<typeof workflows.syncOrganizationVideoStatuses> {
    return workflows.syncOrganizationVideoStatuses(...args);
}
