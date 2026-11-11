import 'server-only';

import { z } from 'zod';

import { createAuthAction } from '@/server/actions/create-auth-action';
import { getPlatformUser } from '@/server/auth/session';
import { prismaClient } from '@/server/db/client';
import { stripe } from '@/server/payments/payments';
export const startCreatorStripeOnboarding = createAuthAction(z.object({}), async (_, { user }) => {
    await getPlatformUser('creator');
    try {
        const dbUser = await prismaClient.user.findUniqueOrThrow({
            select: { email: true, id: true, stripeAccountId: true },
            where: { id: user.id }
        });
        let stripeAccountId = dbUser.stripeAccountId;

        if (!stripeAccountId) {
            const account = await stripe.accounts.create({
                capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true }
                },
                email: dbUser.email,
                metadata: { userId: dbUser.id },
                type: 'express'
            });

            stripeAccountId = account.id;

            await prismaClient.user.update({
                data: { stripeAccountId: account.id },
                where: { id: dbUser.id }
            });
        }

        const onboardingUrl = await stripe.accountLinks.create({
            account: stripeAccountId,
            refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/creator/dashboard/earnings`,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/creator/dashboard/earnings`,
            type: 'account_onboarding'
        });

        return { url: onboardingUrl.url };
    } catch (error) {
        console.error('Failed to start creator Stripe onboarding:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to start onboarding.');
    }
});
export const getCreatorStripeDashboardLink = createAuthAction(z.object({}), async (_, { user }) => {
    await getPlatformUser('creator');
    try {
        const dbUser = await prismaClient.user.findUniqueOrThrow({
            select: { stripeAccountId: true },
            where: { id: user.id }
        });

        if (!dbUser.stripeAccountId) {
            throw new Error('No Stripe Connect account associated with this user.');
        }

        const loginLink = await stripe.accounts.createLoginLink(dbUser.stripeAccountId);
        return { url: loginLink.url };
    } catch (error) {
        console.error('Failed to get creator Stripe dashboard link:', error);
        throw new Error(error instanceof Error ? error.message : 'Failed to generate dashboard link.');
    }
});
