import 'server-only';

import type Stripe from 'stripe';

import { prismaClient as prisma } from '@/server/db/client';

import type { AccountStatus, ConnectAccountResult, PaymentsLogger, StripeConfig } from '@/server/payments/types';

/** Noop logger used when no logger is injected */
const noopLogger: PaymentsLogger = {
    info: () => {},
    error: () => {}
};

/**
 * Creates a configured payments service instance.
 *
 * Uses dependency injection for the shared Stripe client and logging,
 * keeping this module decoupled from any specific env or framework.
 *
 * @example
 * ```ts
 * const payments = createPaymentsService(stripe);
 *
 * const { accountId } = await payments.createExpressAccount(orgId, email);
 * ```
 */
export function createPaymentsService(stripe: Stripe, logger: PaymentsLogger = noopLogger) {
    return {
        /** The raw Stripe client for direct API access when needed */
        stripe,

        /**
         * Create or retrieve a Stripe Express connected account for the given organization.
         * If the org already has a `stripeAccountId`, this is a no-op.
         */
        async createExpressAccount(organizationId: string, email: string): Promise<ConnectAccountResult> {
            const org = await prisma.organization.findUniqueOrThrow({
                select: { stripeAccountId: true },
                where: { id: organizationId }
            });

            if (org.stripeAccountId) {
                return { accountId: org.stripeAccountId, isNew: false };
            }

            const account = await stripe.accounts.create({
                capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true }
                },
                email,
                metadata: { organizationId },
                type: 'express'
            });

            await prisma.organization.update({
                data: { stripeAccountId: account.id },
                where: { id: organizationId }
            });

            logger.info('Stripe Express account created', { accountId: account.id, organizationId });

            return { accountId: account.id, isNew: true };
        },

        /**
         * Generate a Stripe-hosted onboarding link for the org's connected account.
         */
        async createOnboardingLink(
            organizationId: string,
            options: { refreshUrl: string; returnUrl: string }
        ): Promise<string> {
            const org = await prisma.organization.findUniqueOrThrow({
                select: { stripeAccountId: true },
                where: { id: organizationId }
            });

            if (!org.stripeAccountId) {
                throw new Error(`Organization ${organizationId} has no Stripe account`);
            }

            const link = await stripe.accountLinks.create({
                account: org.stripeAccountId,
                refresh_url: options.refreshUrl,
                return_url: options.returnUrl,
                type: 'account_onboarding'
            });

            return link.url;
        },

        /**
         * Generate a Stripe Express dashboard login link for a connected account.
         */
        async createDashboardLink(stripeAccountId: string): Promise<string> {
            const loginLink = await stripe.accounts.createLoginLink(stripeAccountId);
            return loginLink.url;
        },

        /**
         * Retrieve the current status of a connected account.
         */
        async getAccountStatus(stripeAccountId: string): Promise<AccountStatus> {
            const account = await stripe.accounts.retrieve(stripeAccountId);

            return {
                chargesEnabled: account.charges_enabled ?? false,
                detailsSubmitted: account.details_submitted ?? false,
                payoutsEnabled: account.payouts_enabled ?? false
            };
        }
    };
}

/** Payments service instance type */
export type PaymentsService = ReturnType<typeof createPaymentsService>;

export type { AccountStatus, ConnectAccountResult, PaymentsLogger, StripeConfig };
