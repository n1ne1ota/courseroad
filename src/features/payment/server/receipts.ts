import 'server-only';

import { z } from 'zod';

import { AccessError, getAuthenticatedUser } from '@/server/auth/session';
import { env } from '@/server/config/env';
import { prismaClient } from '@/server/db/client';
import { getStripe } from '@/server/payments/payments';

/** Return only the current user's receipt, independent of route layout guards. */
export async function getReceiptUrl(input: unknown) {
    const { purchaseId, isPlatform } = z
        .object({ purchaseId: z.uuid(), isPlatform: z.boolean().default(false) })
        .parse(input);
    const user = await getAuthenticatedUser();
    if (env.NEXT_PUBLIC_PAYMENTS_ENABLED === false) throw new AccessError('Receipts are not available.', 404);
    const query = { where: { id: purchaseId, userId: user.id }, select: { stripeChargeId: true } };
    const purchase = isPlatform
        ? await prismaClient.platformPurchase.findFirst(query)
        : await prismaClient.purchase.findFirst(query);
    if (!purchase?.stripeChargeId) throw new AccessError('Receipt not available for this purchase.', 404);
    const charge = await getStripe().charges.retrieve(purchase.stripeChargeId);
    if (!charge.receipt_url) throw new AccessError('Receipt not available for this purchase.', 404);
    return { receiptUrl: charge.receipt_url };
}
