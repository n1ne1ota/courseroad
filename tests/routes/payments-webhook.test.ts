import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock server-only
vi.mock('server-only', () => ({}));

vi.mock('next/headers', () => ({
    headers: vi.fn(async () => new Headers({ 'Stripe-Signature': 'test-signature' }))
}));

const mockTransaction = {
    course: {
        findUnique: vi.fn()
    },
    enrollment: {
        upsert: vi.fn()
    },
    organization: {
        updateMany: vi.fn()
    },
    platformPurchase: {
        upsert: vi.fn()
    },
    purchase: {
        upsert: vi.fn()
    },
    stripeEvent: {
        create: vi.fn(),
        findUnique: vi.fn()
    },
    user: {
        update: vi.fn(),
        updateMany: vi.fn()
    }
};

const mockPrisma = {
    $transaction: vi.fn(async callback => callback(mockTransaction))
};

const mockStripe = {
    webhooks: {
        constructEvent: vi.fn()
    }
};

vi.mock('@/server/db/client', () => ({
    prismaClient: mockPrisma
}));

vi.mock('@/server/payments/payments', () => ({
    stripe: mockStripe
}));

vi.mock('@/server/config/env', () => ({
    env: {
        STRIPE_SECRET_KEY: 'sk_test',
        STRIPE_WEBHOOK_SECRET: 'whsec_test'
    }
}));

const { POST } = await import('@/app/api/payments/webhook/route');

describe('payments webhook route', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('stores course purchases idempotently using the charge id and payment intent id', async () => {
        mockTransaction.stripeEvent.findUnique.mockResolvedValueOnce(null);
        mockTransaction.course.findUnique.mockResolvedValueOnce({ organizationId: 'org-1' });
        mockStripe.webhooks.constructEvent.mockReturnValueOnce({
            account: null,
            created: 1_713_529_600,
            data: {
                object: {
                    amount: 4900,
                    currency: 'usd',
                    id: 'pi_123',
                    latest_charge: 'ch_123',
                    metadata: {
                        courseId: 'course-1',
                        type: 'course_purchase',
                        userId: 'user-1'
                    },
                    object: 'payment_intent'
                }
            },
            id: 'evt_123',
            livemode: false,
            pending_webhooks: 1,
            request: null,
            type: 'payment_intent.succeeded'
        });

        const response = await POST(
            new Request('http://localhost/api/payments/webhook', { body: '{}', method: 'POST' })
        );

        expect(response.status).toBe(200);
        expect(mockTransaction.stripeEvent.create).toHaveBeenCalledTimes(1);
        expect(mockTransaction.purchase.upsert).toHaveBeenCalledWith({
            create: expect.objectContaining({
                stripeChargeId: 'ch_123',
                stripePaymentIntentId: 'pi_123'
            }),
            update: expect.objectContaining({
                stripeChargeId: 'ch_123',
                stripePaymentIntentId: 'pi_123'
            }),
            where: {
                userId_courseId: {
                    courseId: 'course-1',
                    userId: 'user-1'
                }
            }
        });
        expect(mockTransaction.enrollment.upsert).toHaveBeenCalledWith({
            create: {
                courseId: 'course-1',
                organizationId: 'org-1',
                source: 'Purchase',
                userId: 'user-1'
            },
            update: {
                source: 'Purchase'
            },
            where: {
                userId_courseId: {
                    courseId: 'course-1',
                    userId: 'user-1'
                }
            }
        });
    });

    it('skips business writes when the event was already processed', async () => {
        mockTransaction.stripeEvent.findUnique.mockResolvedValueOnce({ id: 'already-processed' });
        mockStripe.webhooks.constructEvent.mockReturnValueOnce({
            account: null,
            created: 1_713_529_600,
            data: {
                object: {
                    id: 'pi_456',
                    metadata: {},
                    object: 'payment_intent'
                }
            },
            id: 'evt_456',
            livemode: false,
            pending_webhooks: 1,
            request: null,
            type: 'payment_intent.succeeded'
        });

        const response = await POST(
            new Request('http://localhost/api/payments/webhook', { body: '{}', method: 'POST' })
        );

        expect(response.status).toBe(200);
        expect(mockTransaction.stripeEvent.create).not.toHaveBeenCalled();
        expect(mockTransaction.purchase.upsert).not.toHaveBeenCalled();
        expect(mockTransaction.enrollment.upsert).not.toHaveBeenCalled();
    });
});
