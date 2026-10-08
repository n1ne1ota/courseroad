import 'server-only';

import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

import { z } from 'zod';

import { requireCoursePurchase } from '@/features/payment/server/access';
import { auth } from '@/server/auth/auth';
import { AccessError } from '@/server/auth/session';
import { env } from '@/server/config/env';
import { prismaClient as prisma } from '@/server/db/client';
import { logs } from '@/server/logging/server';
import { stripe } from '@/server/payments/payments';

import type { Stripe } from '@/server/payments/types';

export async function POST(req: Request) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const checkoutSchema = z
        .object({
            courseId: z.string().optional(),
            type: z.enum(['activation_fee', 'course_purchase'])
        })
        .strict();

    let courseId: string | undefined;
    let type: 'activation_fee' | 'course_purchase';

    try {
        const body = checkoutSchema.parse(await req.json());
        courseId = body.courseId;
        type = body.type;
    } catch (err: unknown) {
        return new NextResponse(
            err instanceof z.ZodError
                ? JSON.stringify({ details: err.issues, error: 'Validation failed' })
                : 'Invalid request payload',
            { headers: { 'Content-Type': 'application/json' }, status: 400 }
        );
    }
    const user = session.user;

    const lineItems: NonNullable<Stripe.Checkout.SessionCreateParams['line_items']> = [];
    let metadata: Stripe.MetadataParam = {};
    let paymentIntentData: Stripe.Checkout.SessionCreateParams['payment_intent_data'];

    if (type === 'activation_fee') {
        lineItems.push({
            price: env.STRIPE_ACTIVATION_PRICE_ID,
            quantity: 1
        });
        metadata = {
            description: 'Instructor Activation Fee',
            subtype: 'activation_fee',
            type: 'platform_purchase',
            userId: user.id
        };
    } else if (type === 'course_purchase' && courseId) {
        try {
            await requireCoursePurchase(courseId);
        } catch (error) {
            if (error instanceof AccessError) return new NextResponse(error.message, { status: error.status });
            if (error instanceof z.ZodError) return new NextResponse('Invalid course ID', { status: 400 });
            throw error;
        }
        const course = await prisma.course.findUnique({ where: { id: courseId } });

        if (!course) {
            return new NextResponse('Course not found', { status: 404 });
        }

        let stripeAccountId: string | null = null;
        let platformFeePercent = 10; // Default B2C platform fee

        if (course.organizationId) {
            const org = await prisma.organization.findUnique({
                select: {
                    platformFeePercent: true,
                    stripeAccountId: true,
                    stripeOnboardingComplete: true
                },
                where: { id: course.organizationId }
            });

            if (!org?.stripeAccountId || !org.stripeOnboardingComplete) {
                return new NextResponse('Organization not ready for payments', { status: 400 });
            }
            stripeAccountId = org.stripeAccountId;
            platformFeePercent = org.platformFeePercent;
        } else {
            const creator = await prisma.user.findUnique({
                select: {
                    stripeAccountId: true,
                    stripeOnboardingComplete: true
                },
                where: { id: course.userId }
            });

            if (creator?.stripeAccountId && creator.stripeOnboardingComplete) {
                stripeAccountId = creator.stripeAccountId;
            }
        }

        if (course.price === null || course.price === undefined) {
            return new NextResponse('Course price not set', { status: 400 });
        }

        const productData = {
            description: course.description?.substring(0, 100) || '',
            name: course.title
        };

        const unitAmount = Math.round(course.price * 100);

        lineItems.push({
            price_data: {
                currency: 'USD',
                product_data: productData,
                unit_amount: unitAmount
            },
            quantity: 1
        });

        metadata = {
            courseId: course.id,
            type: 'course_purchase',
            userId: user.id
        };

        if (stripeAccountId) {
            const applicationFeeAmount = Math.round(course.price * 100 * (platformFeePercent / 100));
            paymentIntentData = {
                application_fee_amount: applicationFeeAmount,
                transfer_data: {
                    destination: stripeAccountId
                }
            };
        }
    } else {
        return new NextResponse('Invalid request', { status: 400 });
    }

    try {
        const sessionParams: Stripe.Checkout.SessionCreateParams = {
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/courses/${courseId}?canceled=1`,
            customer_email: user.email,
            line_items: lineItems,
            metadata,
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/courses/${courseId}?success=1`
        };

        if (paymentIntentData) {
            sessionParams.payment_intent_data = paymentIntentData;
        }

        const stripeSession = await stripe.checkout.sessions.create(sessionParams);

        return NextResponse.json({ url: stripeSession.url });
    } catch (error) {
        logs.api.error('Payments Checkout error', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
