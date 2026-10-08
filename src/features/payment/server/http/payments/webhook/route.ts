import 'server-only';

import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

import { Prisma } from '@prisma/client';

import { env } from '@/server/config/env';
import { prismaClient as prisma } from '@/server/db/client';
import { stripe } from '@/server/payments/payments';

import type { Stripe } from '@/server/payments/types';

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get('Stripe-Signature') as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return new NextResponse(`Webhook Error: ${errorMessage}`, { status: 400 });
    }

    try {
        await prisma.$transaction(async tx => {
            const existingEvent = await tx.stripeEvent.findUnique({
                select: { id: true },
                where: { apiId: event.id }
            });

            if (existingEvent) {
                return;
            }

            const eventObject =
                typeof event.data.object === 'object' &&
                event.data.object !== null &&
                'object' in event.data.object &&
                typeof event.data.object.object === 'string'
                    ? event.data.object.object
                    : 'unknown';

            await tx.stripeEvent.create({
                data: {
                    account: typeof event.account === 'string' ? event.account : null,
                    apiId: event.id,
                    created: new Date(event.created * 1000),
                    data: event.data as unknown as Prisma.InputJsonValue,
                    livemode: event.livemode,
                    object: eventObject,
                    pendingWebhooks: event.pending_webhooks,
                    request: event.request ? (event.request as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
                    type: event.type,
                    type_description: event.type
                }
            });

            if (event.type === 'payment_intent.succeeded') {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                const metadata = paymentIntent.metadata;
                const stripeChargeId =
                    typeof paymentIntent.latest_charge === 'string' ? paymentIntent.latest_charge : paymentIntent.id;

                if (metadata?.type === 'course_purchase' && metadata.userId && metadata.courseId) {
                    const courseId = metadata.courseId;
                    const userId = metadata.userId;

                    // Resolve org from the course record (webhook is sessionless)
                    const course = await tx.course.findUnique({
                        select: { organizationId: true },
                        where: { id: courseId }
                    });

                    if (!course) {
                        console.error(`Course ${courseId} not found during webhook processing`);
                        return;
                    }

                    const organizationId = course.organizationId;

                    await tx.purchase.upsert({
                        create: {
                            amount: paymentIntent.amount,
                            courseId,
                            currency: paymentIntent.currency,
                            organizationId,
                            stripeChargeId,
                            stripePaymentIntentId: paymentIntent.id,
                            userId
                        },
                        update: {
                            amount: paymentIntent.amount,
                            currency: paymentIntent.currency,
                            status: 'Paid',
                            stripeChargeId,
                            stripePaymentIntentId: paymentIntent.id
                        },
                        where: {
                            userId_courseId: {
                                courseId,
                                userId
                            }
                        }
                    });

                    await tx.enrollment.upsert({
                        create: {
                            courseId,
                            organizationId,
                            source: 'Purchase',
                            userId
                        },
                        update: {
                            source: 'Purchase'
                        },
                        where: {
                            userId_courseId: {
                                courseId,
                                userId
                            }
                        }
                    });
                } else if (metadata?.type === 'platform_purchase' && metadata.userId) {
                    await tx.platformPurchase.upsert({
                        create: {
                            amount: paymentIntent.amount,
                            currency: paymentIntent.currency,
                            description: metadata.description || 'Platform Purchase',
                            metadata: metadata as Prisma.InputJsonValue,
                            stripeChargeId,
                            stripePaymentIntentId: paymentIntent.id,
                            userId: metadata.userId
                        },
                        update: {
                            amount: paymentIntent.amount,
                            currency: paymentIntent.currency,
                            description: metadata.description || 'Platform Purchase',
                            metadata: metadata as Prisma.InputJsonValue,
                            status: 'Paid',
                            stripePaymentIntentId: paymentIntent.id,
                            userId: metadata.userId
                        },
                        where: {
                            stripeChargeId
                        }
                    });

                    if (metadata.subtype === 'activation_fee') {
                        await tx.user.update({
                            data: { hasPaidActivationFee: true },
                            where: { id: metadata.userId }
                        });
                    }
                }
            }

            if (event.type === 'account.updated') {
                const account = event.data.object as Stripe.Account;

                if (account.details_submitted) {
                    await tx.organization.updateMany({
                        data: { stripeOnboardingComplete: true },
                        where: { stripeAccountId: account.id }
                    });

                    await tx.user.updateMany({
                        data: { stripeOnboardingComplete: true },
                        where: { stripeAccountId: account.id }
                    });
                }
            }
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            return new NextResponse(null, { status: 200 });
        }

        throw error;
    }

    return new NextResponse(null, { status: 200 });
}
