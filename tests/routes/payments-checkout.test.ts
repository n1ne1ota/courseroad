import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock Next.js headers
const mockGetSession = vi.fn();

vi.mock('next/headers', () => ({
    headers: vi.fn(async () => new Headers())
}));

vi.mock('@/server/auth/auth', () => ({
    auth: {
        api: { getSession: mockGetSession }
    }
}));

vi.mock('@/server/auth/organization-context', () => ({
    getOrganizationContext: vi.fn().mockResolvedValue({ organizationId: 'org-1', member: { role: 'learner' } })
}));

vi.mock('@/server/config/env', () => ({
    env: {
        STRIPE_ACTIVATION_PRICE_ID: 'price_activation_test'
    }
}));

vi.mock('@/server/logging/server', () => ({
    logs: {
        api: { error: vi.fn(), info: vi.fn() }
    }
}));

// Mock server-only
vi.mock('server-only', () => ({}));

const mockFindUnique = vi.fn();
const mockOrgFindUnique = vi.fn();
const mockPrisma = {
    course: { findUnique: mockFindUnique },
    organization: { findUnique: mockOrgFindUnique }
};

vi.mock('@/server/db/client', () => ({
    prismaClient: mockPrisma
}));

const mockCreateSession = vi.fn();
const mockStripe = {
    checkout: {
        sessions: { create: mockCreateSession }
    }
};

vi.mock('@/server/payments/payments', () => ({
    stripe: mockStripe
}));

const { POST } = await import('@/app/api/payments/checkout/route');

function makeRequest(body: Record<string, unknown>) {
    return new Request('http://localhost/api/payments/checkout', {
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST'
    });
}

describe('Payments Checkout Route', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns 401 when unauthenticated', async () => {
        mockGetSession.mockResolvedValue(null);

        const response = await POST(makeRequest({ type: 'activation_fee' }));

        expect(response.status).toBe(401);
    });

    describe('activation_fee', () => {
        it('creates a checkout session with the activation price ID', async () => {
            mockGetSession.mockResolvedValue({
                user: { email: 'user@example.com', id: 'user-1' }
            });
            mockCreateSession.mockResolvedValue({ url: 'https://checkout.stripe.com/session-1' });

            const response = await POST(makeRequest({ type: 'activation_fee' }));
            const body = await response.json();

            expect(response.status).toBe(200);
            expect(body.url).toBe('https://checkout.stripe.com/session-1');
            expect(mockCreateSession).toHaveBeenCalledWith(
                expect.objectContaining({
                    line_items: [{ price: 'price_activation_test', quantity: 1 }],
                    metadata: expect.objectContaining({
                        subtype: 'activation_fee',
                        type: 'platform_purchase',
                        userId: 'user-1'
                    })
                })
            );
        });
    });

    describe('course_purchase (org-level)', () => {
        const sessionUser = { email: 'buyer@example.com', id: 'buyer-1' };

        beforeEach(() => {
            mockGetSession.mockResolvedValue({ user: sessionUser });
            mockOrgFindUnique.mockImplementation(async () => {
                const results = mockFindUnique.mock.results;
                const course = results[results.length - 1]?.value;
                return course ? (await course).organization : null;
            });
        });

        it('returns 404 when course is not found', async () => {
            mockFindUnique.mockResolvedValue(null);

            const response = await POST(
                makeRequest({ courseId: '22222222-2222-4222-8222-222222222222', type: 'course_purchase' })
            );

            expect(response.status).toBe(404);
        });

        it('returns 400 when organization is not onboarded', async () => {
            mockFindUnique.mockResolvedValue({
                id: '11111111-1111-4111-8111-111111111111',
                organization: {
                    slug: 'test-org',
                    platformFeePercent: 10,
                    stripeAccountId: null,
                    stripeOnboardingComplete: false
                },
                organizationId: 'org-1',
                status: 'Published',
                price: 49
            });

            const response = await POST(
                makeRequest({ courseId: '11111111-1111-4111-8111-111111111111', type: 'course_purchase' })
            );

            expect(response.status).toBe(400);
        });

        it('returns 400 when course price is not set', async () => {
            mockFindUnique.mockResolvedValue({
                id: '11111111-1111-4111-8111-111111111111',
                organization: {
                    platformFeePercent: 10,
                    stripeAccountId: 'acct_123',
                    stripeOnboardingComplete: true
                },
                organizationId: 'org-1',
                status: 'Published',
                price: null
            });

            const response = await POST(
                makeRequest({ courseId: '11111111-1111-4111-8111-111111111111', type: 'course_purchase' })
            );

            expect(response.status).toBe(400);
        });

        it('creates a session with dynamic platform fee and org-level transfer_data', async () => {
            mockFindUnique.mockResolvedValue({
                description: 'Learn TypeScript',
                id: '11111111-1111-4111-8111-111111111111',
                organization: {
                    slug: 'test-org',
                    platformFeePercent: 15,
                    stripeAccountId: 'acct_org_123',
                    stripeOnboardingComplete: true
                },
                organizationId: 'org-1',
                status: 'Published',
                price: 49,
                title: 'TypeScript Masterclass'
            });
            mockCreateSession.mockResolvedValue({ url: 'https://checkout.stripe.com/course-session' });

            const response = await POST(
                makeRequest({ courseId: '11111111-1111-4111-8111-111111111111', type: 'course_purchase' })
            );
            const body = await response.json();

            expect(response.status).toBe(200);
            expect(body.url).toBe('https://checkout.stripe.com/course-session');
            expect(mockCreateSession).toHaveBeenCalledWith(
                expect.objectContaining({
                    line_items: [
                        expect.objectContaining({
                            price_data: expect.objectContaining({
                                unit_amount: 4900
                            }),
                            quantity: 1
                        })
                    ],
                    metadata: expect.objectContaining({
                        courseId: '11111111-1111-4111-8111-111111111111',
                        type: 'course_purchase',
                        userId: 'buyer-1'
                    }),
                    payment_intent_data: expect.objectContaining({
                        application_fee_amount: 735, // 15% of $49 * 100
                        transfer_data: { destination: 'acct_org_123' }
                    })
                })
            );
        });
    });

    it('returns 400 for an invalid type', async () => {
        mockGetSession.mockResolvedValue({
            user: { email: 'user@example.com', id: 'user-1' }
        });

        const response = await POST(makeRequest({ type: 'invalid_type' }));

        expect(response.status).toBe(400);
    });

    it('returns 500 when Stripe SDK throws', async () => {
        mockGetSession.mockResolvedValue({
            user: { email: 'user@example.com', id: 'user-1' }
        });
        mockCreateSession.mockRejectedValue(new Error('Stripe outage'));

        const response = await POST(makeRequest({ type: 'activation_fee' }));

        expect(response.status).toBe(500);
    });
});
