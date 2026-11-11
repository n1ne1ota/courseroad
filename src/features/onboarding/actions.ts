'use server';

import * as workflows from '@/features/onboarding/server/workflows/actions';

/** Mutation transport adapter; validation and authorization are owned by the DAL. */
export async function completeOnboarding(
    ...args: Parameters<typeof workflows.completeOnboarding>
): ReturnType<typeof workflows.completeOnboarding> {
    return workflows.completeOnboarding(...args);
}
