import { beforeEach, describe, expect, it, vi } from 'vitest';

import type * as SessionModule from '@/server/auth/session';
const mocks = vi.hoisted(() => ({
    user: vi.fn(),
    context: vi.fn(),
    course: vi.fn(),
    lesson: vi.fn(),
    organization: vi.fn(),
    enrollment: vi.fn(),
    video: vi.fn()
}));
vi.mock('@/server/auth/auth', () => ({ auth: { api: { getSession: vi.fn() } } }));
vi.mock('@/server/auth/session', async importOriginal => ({
    ...(await importOriginal<typeof SessionModule>()),
    getAuthenticatedUser: mocks.user
}));
vi.mock('@/server/auth/organization-context', () => ({ getOrganizationContext: mocks.context }));
vi.mock('@/server/db/client', () => ({
    prismaClient: {
        course: { findFirst: mocks.course },
        lesson: { findFirst: mocks.lesson },
        organization: { findUnique: mocks.organization },
        enrollment: { findUnique: mocks.enrollment }
    }
}));
vi.mock('@/server/media/stream-service', () => ({ getVideo: mocks.video }));
import { requirePlaybackAccess } from '@/features/media/server/access';
import { AccessError } from '@/server/auth/session';
const id = '11111111-1111-4111-8111-111111111111';
describe('playback DAL authorization', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.course.mockResolvedValue(null);
        mocks.lesson.mockResolvedValue({
            isPreview: false,
            module: { course: { id: 'course', userId: 'author', organizationId: 'org', status: 'Published' } }
        });
        mocks.user.mockResolvedValue({ id: 'learner' });
        mocks.organization.mockResolvedValue({ slug: 'alpha' });
        mocks.context.mockResolvedValue({ member: { role: 'learner' }, organizationId: 'org' });
        mocks.enrollment.mockResolvedValue(null);
    });
    it('allows anonymous published previews without reading a session', async () => {
        mocks.lesson.mockResolvedValue({ isPreview: true, module: { course: { status: 'Published' } } });
        await expect(requirePlaybackAccess(id)).resolves.toBeNull();
        expect(mocks.user).not.toHaveBeenCalled();
    });
    it('rejects anonymous access to private lessons', async () => {
        mocks.user.mockRejectedValue(new AccessError('Unauthorized', 401));
        await expect(requirePlaybackAccess(id)).rejects.toMatchObject({ status: 401 });
    });
    it('rejects a private lesson without enrollment', async () => {
        await expect(requirePlaybackAccess(id)).rejects.toMatchObject({ status: 403 });
    });
    it('allows the caller’s enrolled lesson', async () => {
        mocks.enrollment.mockResolvedValue({ id: 'enrollment' });
        await expect(requirePlaybackAccess(id)).resolves.toBeNull();
    });
    it('rejects another URL organization before requesting a token', async () => {
        await expect(requirePlaybackAccess(id, 'beta')).rejects.toMatchObject({ status: 404 });
        expect(mocks.video).not.toHaveBeenCalled();
    });
    it('rejects non-members even when they own an enrollment', async () => {
        mocks.context.mockRejectedValue(new AccessError('Not found', 404));
        mocks.enrollment.mockResolvedValue({ id: 'enrollment' });
        await expect(requirePlaybackAccess(id)).rejects.toMatchObject({ status: 404 });
    });
    it('previews only uploads bearing the verified tenant prefix', async () => {
        mocks.lesson.mockResolvedValue(null);
        mocks.context.mockResolvedValue({ organizationId: 'org', member: { role: 'creator' } });
        mocks.video.mockResolvedValue({ title: '[other-org] upload' });
        await expect(requirePlaybackAccess(id, 'alpha')).rejects.toMatchObject({ status: 404 });
        mocks.video.mockResolvedValue({ title: '[org] upload' });
        await expect(requirePlaybackAccess(id, 'alpha')).resolves.toMatchObject({ title: '[org] upload' });
    });
});
