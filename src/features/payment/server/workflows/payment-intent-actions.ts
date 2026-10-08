import 'server-only';

import { z } from 'zod';

import { requireCoursePurchase } from '@/features/payment/server/access';
import { createSafeAction } from '@/server/actions/create-safe-action';
import { requireAuthAction } from '@/server/auth/require-auth-action';
import { prismaClient as prisma } from '@/server/db/client';
import { stripe } from '@/server/payments/payments';

export const createPaymentIntent = createSafeAction(
    z.object({
        courseId: z.uuid('Invalid course ID')
    }),
    async ({ courseId }) => {
        await requireCoursePurchase(courseId);
        let user;
        try {
            user = await requireAuthAction();
        } catch {
            throw new Error('You must be logged in to purchase a course.');
        }

        // Validate the course and get its price
        const course = await prisma.course.findUnique({
            select: { id: true, price: true, status: true },
            where: { id: courseId }
        });

        if (!course) {
            throw new Error('Course not found.');
        }

        if (course.status !== 'Published') {
            throw new Error('This course is not available for purchase.');
        }

        const existingEnrollment = await prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    courseId,
                    userId: user.id
                }
            }
        });

        if (existingEnrollment) {
            throw new Error('You are already enrolled in this course.');
        }

        if (!course.price || course.price <= 0) {
            throw new Error('This course does not have a valid price.');
        }

        // Create a PaymentIntent with the course price (assuming price is stored in cents)
        const paymentIntent = await stripe.paymentIntents.create({
            amount: course.price,
            currency: 'usd',
            // In the latest API, automatic payment methods are enabled by default
            automatic_payment_methods: {
                enabled: true
            },
            metadata: {
                courseId: course.id,
                type: 'course_purchase',
                userId: user.id
            }
        });

        if (!paymentIntent.client_secret) {
            throw new Error('Failed to initialize payment.');
        }

        return paymentIntent.client_secret;
    }
);
