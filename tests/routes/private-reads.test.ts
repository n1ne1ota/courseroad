import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({
    user: vi.fn(),
    role: vi.fn(),
    purchase: vi.fn(),
    platformPurchase: vi.fn(),
    charge: vi.fn(),
    signals: vi.fn()
}));
vi.mock('@/server/auth/session', async importOriginal => ({
    ...(await importOriginal()),
    getAuthenticatedUser: mocks.user,
    getPlatformUser: mocks.role
}));
vi.mock('@/server/db/client', () => ({
    prismaClient: {
        purchase: { findFirst: mocks.purchase },
        platformPurchase: { findFirst: mocks.platformPurchase },
        deviceFingerprint: { findUnique: mocks.signals }
    }
}));
vi.mock('@/server/payments/payments', () => ({ stripe: { charges: { retrieve: mocks.charge } } }));
vi.mock('next/server', async importOriginal => ({ ...(await importOriginal()), connection: async () => {} }));
import { GET as signals } from '@/app/api/analytics/visitors/[visitorId]/signals/route';
import { GET as receipt } from '@/app/api/payments/receipts/[purchaseId]/route';
import { AccessError } from '@/server/auth/session';
const id = '5e8378fe-d7a7-403d-b888-605d645c6221';
describe('private browser GET reads', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.user.mockResolvedValue({ id: 'caller' });
        mocks.role.mockResolvedValue({ id: 'admin' });
        mocks.purchase.mockResolvedValue({ stripeChargeId: 'ch_test' });
        mocks.platformPurchase.mockResolvedValue({ stripeChargeId: 'ch_platform' });
        mocks.charge.mockResolvedValue({ receipt_url: 'https://stripe.test/receipt' });
    });
    it('validates identifiers and boolean query parameters', async () => {
        expect(
            (
                await receipt(new Request('http://localhost?isPlatform=yes'), {
                    params: Promise.resolve({ purchaseId: id })
                })
            ).status
        ).toBe(400);
        expect(
            (await receipt(new Request('http://localhost'), { params: Promise.resolve({ purchaseId: 'invalid' }) }))
                .status
        ).toBe(400);
        expect(mocks.purchase).not.toHaveBeenCalled();
    });
    it('rejects authentication and purchase ownership failures', async () => {
        mocks.user.mockRejectedValue(new AccessError('Unauthorized', 401));
        expect(
            (await receipt(new Request('http://localhost'), { params: Promise.resolve({ purchaseId: id }) })).status
        ).toBe(401);
        mocks.user.mockResolvedValue({ id: 'caller' });
        mocks.purchase.mockResolvedValue(null);
        expect(
            (await receipt(new Request('http://localhost'), { params: Promise.resolve({ purchaseId: id }) })).status
        ).toBe(404);
    });
    it('returns only the caller receipt with private no-store headers', async () => {
        const response = await receipt(new Request('http://localhost'), {
            params: Promise.resolve({ purchaseId: id })
        });
        expect(response.headers.get('Cache-Control')).toBe('private, no-store');
        expect(await response.json()).toEqual({ data: { receiptUrl: 'https://stripe.test/receipt' } });
        expect(mocks.purchase).toHaveBeenCalledWith({
            where: { id, userId: 'caller' },
            select: { stripeChargeId: true }
        });
    });
    it('selects platform purchases explicitly', async () => {
        const response = await receipt(new Request('http://localhost?isPlatform=true'), {
            params: Promise.resolve({ purchaseId: id })
        });
        expect(response.status).toBe(200);
        expect(mocks.platformPurchase).toHaveBeenCalled();
        expect(mocks.purchase).not.toHaveBeenCalled();
    });
    it('requires admin access for telemetry, even without a layout', async () => {
        mocks.role.mockRejectedValue(new AccessError('Forbidden'));
        expect(
            (await signals(new Request('http://localhost'), { params: Promise.resolve({ visitorId: 'visitor' }) }))
                .status
        ).toBe(403);
        expect(mocks.signals).not.toHaveBeenCalled();
    });
    it('serializes telemetry dates through the HTTP boundary', async () => {
        mocks.signals.mockResolvedValue({ visitorId: 'visitor', lastSeenAt: new Date('2026-10-04T00:00:00Z') });
        const response = await signals(new Request('http://localhost'), {
            params: Promise.resolve({ visitorId: 'visitor' })
        });
        expect(await response.json()).toEqual({
            data: { visitorId: 'visitor', lastSeenAt: '2026-10-04T00:00:00.000Z' }
        });
        expect(response.headers.get('Cache-Control')).toBe('private, no-store');
    });
});
