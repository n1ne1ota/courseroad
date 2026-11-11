import { beforeEach, describe, expect, it, vi } from 'vitest';

import type * as SessionModule from '@/server/auth/session';
const mocks = vi.hoisted(() => ({ user: vi.fn(), course: vi.fn(), organization: vi.fn(), context: vi.fn() }));
vi.mock('@/server/auth/auth', () => ({ auth: { api: { getSession: vi.fn() } } }));
vi.mock('@/server/auth/session', async original => ({
    ...(await original<typeof SessionModule>()),
    getAuthenticatedUser: mocks.user
}));
vi.mock('@/server/auth/organization-context', () => ({ getOrganizationContext: mocks.context }));
vi.mock('@/server/db/client', () => ({
    prismaClient: { course: { findUnique: mocks.course }, organization: { findUnique: mocks.organization } }
}));
import { requireCoursePurchase } from '@/features/payment/server/access';
import { AccessError } from '@/server/auth/session';
const id = '11111111-1111-4111-8111-111111111111';
describe('checkout DAL access', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.user.mockResolvedValue({ id: 'buyer' });
        mocks.course.mockResolvedValue({ id, organizationId: 'org', status: 'Published' });
        mocks.organization.mockResolvedValue({ slug: 'alpha' });
        mocks.context.mockResolvedValue({ organizationId: 'org' });
    });
    it('rejects invalid identifiers before database work', async () => {
        await expect(requireCoursePurchase('other')).rejects.toThrow();
        expect(mocks.course).not.toHaveBeenCalled();
    });
    it('rejects unauthenticated calls without a layout', async () => {
        mocks.user.mockRejectedValue(new AccessError('Unauthorized', 401));
        await expect(requireCoursePurchase(id)).rejects.toMatchObject({ status: 401 });
    });
    it('rejects unpublished and missing courses', async () => {
        mocks.course.mockResolvedValue({ status: 'Draft' });
        await expect(requireCoursePurchase(id)).rejects.toMatchObject({ status: 404 });
        mocks.course.mockResolvedValue(null);
        await expect(requireCoursePurchase(id)).rejects.toMatchObject({ status: 404 });
    });
    it('rejects foreign organizations for non-members', async () => {
        mocks.context.mockRejectedValue(new AccessError('Not found', 404));
        await expect(requireCoursePurchase(id)).rejects.toMatchObject({ status: 404 });
    });
    it('checks the resource organization instead of an active preference', async () => {
        await requireCoursePurchase(id);
        expect(mocks.context).toHaveBeenCalledWith('alpha');
    });
    it('keeps platform purchases independent of organization context', async () => {
        mocks.course.mockResolvedValue({ id, organizationId: null, status: 'Published' });
        await expect(requireCoursePurchase(id)).resolves.toMatchObject({ user: { id: 'buyer' } });
        expect(mocks.context).not.toHaveBeenCalled();
    });
});
