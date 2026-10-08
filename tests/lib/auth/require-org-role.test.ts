import type { Route } from 'next';

import { beforeEach, describe, expect, it, vi } from 'vitest';
const context = vi.hoisted(() => vi.fn());
vi.mock('@/server/auth/organization-context', () => ({ getOrganizationContext: context }));
vi.mock('@/server/auth/auth', () => ({ auth: { api: {} } }));
vi.mock('next/navigation', () => ({
    redirect: (url: string) => {
        throw new Error(`NEXT_REDIRECT:${url}`);
    },
    notFound: () => {
        throw new Error('NEXT_NOT_FOUND');
    }
}));
import { requireOrgRole } from '@/server/auth/require-org-role';
import { AccessError } from '@/server/auth/session';
describe('organization route guard adapter', () => {
    beforeEach(() => vi.clearAllMocks());
    it('passes the explicit slug and required role to the authoritative context', async () => {
        context.mockResolvedValue({ organizationId: 'org' });
        expect(await requireOrgRole('manager', '/' as Route, 'alpha')).toEqual({ organizationId: 'org' });
        expect(context).toHaveBeenCalledWith('alpha', 'manager');
    });
    it('redirects unauthenticated navigation to sign-in', async () => {
        context.mockRejectedValue(new AccessError('Unauthorized', 401));
        await expect(requireOrgRole('learner')).rejects.toThrow('NEXT_REDIRECT:/sign-in');
    });
    it('hides missing memberships and resources', async () => {
        context.mockRejectedValue(new AccessError('Not found', 404));
        await expect(requireOrgRole('learner')).rejects.toThrow('NEXT_NOT_FOUND');
    });
    it('preserves the configured redirect for insufficient roles', async () => {
        context.mockRejectedValue(new AccessError('Forbidden'));
        await expect(requireOrgRole('owner', '/dashboard' as Route, 'alpha')).rejects.toThrow(
            'NEXT_REDIRECT:/dashboard'
        );
    });
    it('does not disguise unexpected failures as authorization failures', async () => {
        context.mockRejectedValue(new Error('database unavailable'));
        await expect(requireOrgRole('learner')).rejects.toThrow('database unavailable');
    });
});
