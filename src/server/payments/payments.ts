import 'server-only';

import Stripe from 'stripe';

import { env } from '@/server/config/env';

/** Shared Stripe SDK client; domain workflows live in payment/server. */
export const stripe = new Stripe(env.STRIPE_SECRET_KEY.trim(), { appInfo: { name: 'Courseroad', version: '0.1.1' } });
