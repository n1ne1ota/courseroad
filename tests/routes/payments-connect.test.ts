import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock server-only
vi.mock('server-only', () => ({}));

const mockGetSession = vi.fn();

vi.mock('next/headers', () => ({
    headers: vi.fn(async () => new Headers())
}));

vi.mock('@/server/auth/auth', () => ({
    auth: {
        api: { getSession: mockGetSession }
    }
}));

vi.mock('@/server/logging/server', () => ({
    logs: {
        api: { error: vi.fn(), info: vi.fn() }
    }
}));

const mockMemberFindUnique = vi.fn();
const mockPrisma = {
    member: {
        findUnique: mockMemberFindUnique
    }
};

vi.mock('@/server/db/client', () => ({
    prismaClient: mockPrisma
}));

const mockCreateExpressAccount = vi.fn();
const mockCreateOnboardingLink = vi.fn();

vi.mock('@/features/payment/server/repositories/integration', () => ({
    createExpressAccount: mockCreateExpressAccount,
    createOnboardingLink: mockCreateOnboardingLink
}));

const { POST } = await import('@/app/api/payments/connect/route');

function makeRequest(body: Record<string, unknown> = {}) {
    return new Request('http://localhost/api/payments/connect', {
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST'
    });
}

describe('Payments Connect Route (org-level)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns 401 when unauthenticated', async () => {
        mockGetSession.mockResolvedValue(null);

        const response = await POST(makeRequest({ organizationId: 'org-1' }));

        expect(response.status).toBe(401);
    });

    it('returns 400 when organizationId is missing', async () => {
        mockGetSession.mockResolvedValue({ user: { email: 'user@test.com', id: 'user-1' } });

        const response = await POST(makeRequest({}));

        expect(response.status).toBe(400);
    });

    it('returns 403 when user is not an owner or admin', async () => {
        mockGetSession.mockResolvedValue({ user: { email: 'user@test.com', id: 'user-1' } });
        mockMemberFindUnique.mockResolvedValue({
            organization: { slug: 'test-org' },
            role: 'learner'
        });

        const response = await POST(makeRequest({ organizationId: 'org-1' }));

        expect(response.status).toBe(403);
    });

    it('returns 403 when user has no membership', async () => {
        mockGetSession.mockResolvedValue({ user: { email: 'user@test.com', id: 'user-1' } });
        mockMemberFindUnique.mockResolvedValue(null);

        const response = await POST(makeRequest({ organizationId: 'org-1' }));

        expect(response.status).toBe(403);
    });

    it('creates a new Express account and returns onboarding URL', async () => {
        mockGetSession.mockResolvedValue({ user: { email: 'owner@test.com', id: 'owner-1' } });
        mockMemberFindUnique.mockResolvedValue({
            organization: { slug: 'acme' },
            role: 'owner'
        });
        mockCreateExpressAccount.mockResolvedValue({ accountId: 'acct_new_123', isNew: true });
        mockCreateOnboardingLink.mockResolvedValue('https://connect.stripe.com/onboarding');

        const response = await POST(makeRequest({ organizationId: 'org-1' }));
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.url).toBe('https://connect.stripe.com/onboarding');
        expect(body.accountId).toBe('acct_new_123');

        expect(mockCreateExpressAccount).toHaveBeenCalledWith('org-1', 'owner@test.com');
        expect(mockCreateOnboardingLink).toHaveBeenCalledWith('org-1', {
            refreshUrl: expect.stringContaining('/organization/acme/settings'),
            returnUrl: expect.stringContaining('/organization/acme/settings')
        });
    });

    it('works for manager role', async () => {
        mockGetSession.mockResolvedValue({ user: { email: 'manager@test.com', id: 'manager-1' } });
        mockMemberFindUnique.mockResolvedValue({
            organization: { slug: 'acme' },
            role: 'manager'
        });
        mockCreateExpressAccount.mockResolvedValue({ accountId: 'acct_existing', isNew: false });
        mockCreateOnboardingLink.mockResolvedValue('https://connect.stripe.com/return');

        const response = await POST(makeRequest({ organizationId: 'org-1' }));

        expect(response.status).toBe(200);
    });

    it('returns 500 when service throws', async () => {
        mockGetSession.mockResolvedValue({ user: { email: 'owner@test.com', id: 'owner-1' } });
        mockMemberFindUnique.mockResolvedValue({
            organization: { slug: 'acme' },
            role: 'owner'
        });
        mockCreateExpressAccount.mockRejectedValue(new Error('Stripe outage'));

        const response = await POST(makeRequest({ organizationId: 'org-1' }));

        expect(response.status).toBe(500);
    });
});
