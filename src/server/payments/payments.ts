import 'server-only';

import Stripe from 'stripe';

import { env } from '@/server/config/env';

let stripeClient: Stripe | undefined;

/** Initialize Stripe only when an enabled payment operation needs it. */
export function getStripe(): Stripe {
    if (env.NEXT_PUBLIC_PAYMENTS_ENABLED === false) throw new Error('Payments are not enabled in this environment.');
    if (!env.STRIPE_SECRET_KEY) throw new Error('Stripe is not configured.');

    stripeClient ??= new Stripe(env.STRIPE_SECRET_KEY.trim(), {
        appInfo: { name: 'Courseroad', version: '0.1.1' }
    });
    return stripeClient;
}
