'use server';
import * as workflows from '@/features/payment/server/workflows/creator-actions';
export async function startCreatorStripeOnboarding(
    ...args: Parameters<typeof workflows.startCreatorStripeOnboarding>
): ReturnType<typeof workflows.startCreatorStripeOnboarding> {
    return workflows.startCreatorStripeOnboarding(...args);
}
export async function getCreatorStripeDashboardLink(
    ...args: Parameters<typeof workflows.getCreatorStripeDashboardLink>
): ReturnType<typeof workflows.getCreatorStripeDashboardLink> {
    return workflows.getCreatorStripeDashboardLink(...args);
}
