'use server';

import * as workflows from '@/features/payment/server/workflows/payment-intent-actions';

/** Mutation transport adapter; validation and authorization are owned by the DAL. */
export async function createPaymentIntent(
    ...args: Parameters<typeof workflows.createPaymentIntent>
): ReturnType<typeof workflows.createPaymentIntent> {
    return workflows.createPaymentIntent(...args);
}

/** Mutation transport adapter; validation and authorization are owned by the DAL. */
