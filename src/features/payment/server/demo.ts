import 'server-only';

import { getAuthenticatedUser } from '@/server/auth/session';
import { stripe } from '@/server/payments/payments';
export async function getMockClientSecret() {
    await getAuthenticatedUser();

    const paymentIntent = await stripe.paymentIntents.create({
        amount: 5000, // $50.00
        automatic_payment_methods: {
            enabled: true
        },
        currency: 'usd',
        metadata: {
            courseId: 'mock-course-123',
            type: 'course_purchase',
            userId: 'mock-user-456'
        }
    });

    return paymentIntent.client_secret;
}
