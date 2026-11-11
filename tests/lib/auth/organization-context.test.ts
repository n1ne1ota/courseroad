import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ session: vi.fn(), organization: vi.fn(), member: vi.fn(), scope: vi.fn() }));
vi.mock('next/headers', () => ({ headers: async () => new Headers({ 'x-organization-slug': 'alpha' }) }));
vi.mock('@/server/auth/auth', () => ({ auth: { api: { getSession: mocks.session } } }));
vi.mock('@/server/db/client', () => ({
    prismaClient: { organization: { findUnique: mocks.organization }, member: { findUnique: mocks.member } }
}));
vi.mock('@/server/db/tenant', () => ({ withTenantScope: mocks.scope }));
import { getOrganizationContext } from '@/server/auth/organization-context';
import { getTenantPrisma } from '@/server/db/get-tenant-prisma';

describe('URL organization DAL context', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.session.mockResolvedValue({ user: { id: 'user' }, session: { activeOrganizationId: 'beta-id' } });
        mocks.organization.mockImplementation(async ({ where }: { where: { slug: string } }) => ({
            id: `${where.slug}-id`,
            slug: where.slug
        }));
        mocks.member.mockImplementation(
            async ({ where }: { where: { userId_organizationId: { organizationId: string } } }) => ({
                role: 'creator',
                organizationId: where.userId_organizationId.organizationId
            })
        );
        mocks.scope.mockImplementation((_client, id) => ({ organizationId: id }));
    });
    it('rejects unauthenticated direct calls without a layout', async () => {
        mocks.session.mockResolvedValue(null);
        await expect(getOrganizationContext('alpha')).rejects.toMatchObject({ status: 401 });
        expect(mocks.organization).not.toHaveBeenCalled();
    });
    it('rejects missing and malformed URL context', async () => {
        await expect(getOrganizationContext('../alpha')).rejects.toMatchObject({ status: 404 });
    });
    it('rejects an organization where the caller has no membership', async () => {
        mocks.member.mockResolvedValue(null);
        await expect(getOrganizationContext('alpha')).rejects.toMatchObject({ status: 404 });
    });
    it('rejects insufficient and unknown roles', async () => {
        await expect(getOrganizationContext('alpha', 'manager')).rejects.toMatchObject({ status: 403 });
        mocks.member.mockResolvedValue({ role: 'unknown' });
        await expect(getOrganizationContext('alpha', 'learner')).rejects.toMatchObject({ status: 403 });
    });
    it('isolates two simultaneous URL tenants despite a shared active preference', async () => {
        const [alpha, beta] = await Promise.all([getTenantPrisma('alpha'), getTenantPrisma('beta')]);
        expect(alpha).toEqual({ organizationId: 'alpha-id' });
        expect(beta).toEqual({ organizationId: 'beta-id' });
        mocks.session.mockResolvedValue({ user: { id: 'user' }, session: { activeOrganizationId: 'alpha-id' } });
        expect((await getOrganizationContext('beta')).organizationId).toBe('beta-id');
    });
    it('uses the route header only as a selector and verifies membership again', async () => {
        expect((await getOrganizationContext()).organizationId).toBe('alpha-id');
        expect(mocks.member).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { userId_organizationId: { organizationId: 'alpha-id', userId: 'user' } }
            })
        );
    });
});
