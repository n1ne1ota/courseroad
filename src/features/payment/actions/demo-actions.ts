'use server';

import { z } from 'zod';

import { getMockClientSecret } from '@/features/payment/server/demo';
import { createSafeAction } from '@/server/actions/create-safe-action';

export async function initializeDemoCheckout() {
    return createSafeAction(z.object({}), async () => {
        const secret = await getMockClientSecret();
        if (!secret) throw new Error('Failed to initialize payment.');
        return secret;
    })({});
}
