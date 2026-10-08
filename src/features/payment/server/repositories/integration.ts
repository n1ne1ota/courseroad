import 'server-only';

import { createPaymentsService } from '@/features/payment/server/repositories/service';
import { logs } from '@/server/logging/server';
import { stripe as stripeClient } from '@/server/payments/payments';

/**
 * Payments service instance configured with app-specific env and logging.
 * Connect workflows use the shared server SDK client.
 */
const payments = createPaymentsService(stripeClient, {
    error: (message, error) => logs.api.error(message, error),
    info: (message, meta) => logs.api.info(message, meta)
});

/** Re-export the raw Stripe client for route handlers that need direct API access */
export const stripe = payments.stripe;

/** Re-export Connect operations */
export const { createDashboardLink, createExpressAccount, createOnboardingLink, getAccountStatus } = payments;
