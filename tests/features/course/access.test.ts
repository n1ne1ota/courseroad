import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({
    user: vi.fn(),
    course: vi.fn(),
    organization: vi.fn(),
    enrollment: vi.fn(),
    lesson: vi.fn(),
    context: vi.fn()
}));
vi.mock('@/server/auth/session', async importOriginal => ({
    ...(await importOriginal()),
    getAuthenticatedUser: mocks.user
}));
vi.mock('@/server/auth/organization-context', () => ({ getOrganizationContext: mocks.context }));
vi.mock('@/server/db/client', () => ({
    prismaClient: {
        course: { findUnique: mocks.course },
        organization: { findUnique: mocks.organization },
        enrollment: { findUnique: mocks.enrollment },
        lesson: { findUnique: mocks.lesson }
    }
}));
import { requireCourseAccess, requireLessonAccess } from '@/features/course/server/access';
const courseId = '5e8378fe-d7a7-403d-b888-605d645c6221';
const lessonId = '776b73aa-53dc-4b05-a496-82c206abb6af';
describe('course access without layout guards', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.user.mockResolvedValue({ id: 'learner' });
        mocks.course.mockResolvedValue({
            id: courseId,
            userId: 'creator',
            organizationId: 'org',
            status: 'Published',
            price: 0
        });
        mocks.organization.mockResolvedValue({ slug: 'alpha' });
        mocks.context.mockResolvedValue({ member: { role: 'learner' } });
        mocks.enrollment.mockResolvedValue({ id: 'enrollment' });
        mocks.lesson.mockResolvedValue({ id: lessonId, module: { courseId } });
    });
    it('rejects a resource from another URL organization', async () => {
        await expect(requireCourseAccess(courseId, 'learn', 'beta')).rejects.toMatchObject({ status: 404 });
    });
    it('requires enrollment before returning lesson content', async () => {
        mocks.enrollment.mockResolvedValue(null);
        await expect(requireCourseAccess(courseId)).rejects.toMatchObject({ status: 403 });
    });
    it('binds lesson identifiers to the authorized course', async () => {
        mocks.lesson.mockResolvedValue({ module: { courseId: 'another-course' } });
        await expect(requireLessonAccess(courseId, lessonId)).rejects.toMatchObject({ status: 404 });
    });
    it('rejects non-owner editors even when their route role is creator', async () => {
        mocks.context.mockResolvedValue({ member: { role: 'creator' } });
        await expect(requireCourseAccess(courseId, 'edit', 'alpha')).rejects.toMatchObject({ status: 404 });
    });
    it('permits a verified manager to edit', async () => {
        mocks.context.mockResolvedValue({ member: { role: 'manager' } });
        expect((await requireCourseAccess(courseId, 'edit', 'alpha')).user.id).toBe('learner');
    });
    it('blocks paid course free-enrollment bypasses', async () => {
        mocks.course.mockResolvedValue({ id: courseId, organizationId: null, status: 'Published', price: 1000 });
        mocks.enrollment.mockResolvedValue(null);
        await expect(requireCourseAccess(courseId, 'enroll')).rejects.toMatchObject({ status: 403 });
    });
});
