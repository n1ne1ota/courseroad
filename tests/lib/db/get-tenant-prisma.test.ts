import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ context: vi.fn(), scope: vi.fn() }));
vi.mock('@/server/auth/organization-context', () => ({ getOrganizationContext: mocks.context }));
vi.mock('@/server/db/client', () => ({ prismaClient: {} }));
vi.mock('@/server/db/tenant', () => ({ withTenantScope: mocks.scope }));
import { getTenantPrisma } from '@/server/db/get-tenant-prisma';
describe('verified tenant client', () => {
    beforeEach(() => vi.clearAllMocks());
    it('uses only the organization returned by membership verification', async () => {
        mocks.context.mockResolvedValue({ organizationId: 'verified' });
        mocks.scope.mockReturnValue({ scoped: true });
        expect(await getTenantPrisma('alpha', 'creator')).toEqual({ scoped: true });
        expect(mocks.context).toHaveBeenCalledWith('alpha', 'creator');
        expect(mocks.scope).toHaveBeenCalledWith({}, 'verified');
    });
    it('does not create a client when verification fails', async () => {
        mocks.context.mockRejectedValue(new Error('Forbidden'));
        await expect(getTenantPrisma('alpha')).rejects.toThrow('Forbidden');
        expect(mocks.scope).not.toHaveBeenCalled();
    });
});
