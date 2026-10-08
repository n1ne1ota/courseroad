'use server';
import * as workflows from '@/features/auth/server/workflows/creator-actions';
export async function updateInstructorProfile(
    ...args: Parameters<typeof workflows.updateInstructorProfile>
): ReturnType<typeof workflows.updateInstructorProfile> {
    return workflows.updateInstructorProfile(...args);
}
