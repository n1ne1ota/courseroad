import 'server-only';

import { z } from 'zod';

import { AccessError, getAuthenticatedUser } from '@/server/auth/session';
import { prismaClient } from '@/server/db/client';
import { stripe } from '@/server/payments/payments';

/** Return only the current user's receipt, independent of route layout guards. */
export async function getReceiptUrl(input: unknown) {
    const { purchaseId, isPlatform } = z
        .object({ purchaseId: z.uuid(), isPlatform: z.boolean().default(false) })
        .parse(input);
    const user = await getAuthenticatedUser();
    const query = { where: { id: purchaseId, userId: user.id }, select: { stripeChargeId: true } };
    const purchase = isPlatform
        ? await prismaClient.platformPurchase.findFirst(query)
        : await prismaClient.purchase.findFirst(query);
    if (!purchase?.stripeChargeId) throw new AccessError('Receipt not available for this purchase.', 404);
    const charge = await stripe.charges.retrieve(purchase.stripeChargeId);
    if (!charge.receipt_url) throw new AccessError('Receipt not available for this purchase.', 404);
    return { receiptUrl: charge.receipt_url };
}
