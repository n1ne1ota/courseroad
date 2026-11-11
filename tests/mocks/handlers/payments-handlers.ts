import { http, HttpResponse } from 'msw';

export const paymentsHandlers = [
    // Mock Payments webhook endpoint
    http.post('/api/payments/webhook', () => {
        return HttpResponse.json({ received: true }, { status: 200 });
    }),

    // Mock Payments checkout session creation
    http.post('/api/payments/checkout', () => {
        return HttpResponse.json({
            url: 'https://checkout.stripe.com/test-session'
        });
    })
];
