import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }));
vi.mock('next/navigation', () => ({
    redirect: (url: string) => {
        throw new Error(`NEXT_REDIRECT:${url}`);
    }
}));
vi.mock('next/headers', () => ({ headers: vi.fn().mockResolvedValue(new Headers()) }));
vi.mock('@/server/logging/server', () => ({
    log: { error: vi.fn() },
    logs: { db: { error: vi.fn(), info: vi.fn(), warn: vi.fn() } }
}));
const mockRequireAuthAction = vi.fn();
vi.mock('@/server/auth/require-auth-action', () => ({
    requireAuthAction: () => mockRequireAuthAction()
}));

const mockCourseFindUnique = vi.fn();
const mockOrgFindUnique = vi.fn();
const mockEnrollmentUpsert = vi.fn();
const mockUserLessonProgressUpsert = vi.fn();

const mockPrisma = {
    course: { findUnique: mockCourseFindUnique },
    enrollment: { upsert: mockEnrollmentUpsert },
    organization: { findUnique: mockOrgFindUnique },
    userLessonProgress: { upsert: mockUserLessonProgressUpsert }
};

vi.mock('@/server/db/client', () => ({
    prismaClient: mockPrisma
}));

vi.mock('@/server/db/tenant', () => ({
    withTenantScope: vi.fn().mockImplementation(client => client)
}));

vi.mock('@/features/course/server/access', () => ({
    requireCourseAccess: async (courseId: string) => {
        const user = await mockRequireAuthAction();
        const course = await mockCourseFindUnique({ where: { id: courseId } });
        if (!course) throw new Error('Course not found');
        return { user, course };
    },
    requireLessonAccess: async () => ({ user: await mockRequireAuthAction() })
}));
const { enrollInCourse, markLessonComplete } = await import('@/features/course/actions/learning-actions');

const mockUser = { id: 'user-1', role: 'learner' };
const mockCourseId = '11111111-1111-4111-8111-111111111111';
const mockLessonId = '22222222-2222-4222-8222-222222222222';

describe('Learning Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockRequireAuthAction.mockResolvedValue(mockUser);
        mockCourseFindUnique.mockResolvedValue({
            id: mockCourseId,
            organizationId: 'org-1'
        });
        mockOrgFindUnique.mockResolvedValue({
            slug: 'test-org'
        });
    });

    describe('enrollInCourse', () => {
        it('returns error when unauthenticated', async () => {
            mockRequireAuthAction.mockRejectedValue(new Error('Unauthorized'));
            const result = await enrollInCourse({ success: false }, { courseId: mockCourseId });
            expect(result).toEqual({ error: 'Unauthorized', success: false });
        });

        it('upserts enrollment and redirects', async () => {
            mockPrisma.enrollment.upsert.mockResolvedValue({ id: 'e-1' });

            await expect(enrollInCourse({ success: false }, { courseId: mockCourseId })).rejects.toThrow(
                `NEXT_REDIRECT:/organization/test-org/learner/dashboard/learn/${mockCourseId}`
            );

            expect(mockPrisma.enrollment.upsert).toHaveBeenCalledWith({
                create: { courseId: mockCourseId, organizationId: 'org-1', source: 'Free', userId: 'user-1' },
                update: {},
                where: { userId_courseId: { courseId: mockCourseId, userId: 'user-1' } }
            });
        });
    });

    describe('markLessonComplete', () => {
        it('upserts progress with isCompleted true and a Date', async () => {
            mockPrisma.userLessonProgress.upsert.mockResolvedValue({});
            await markLessonComplete({ courseId: mockCourseId, lessonId: mockLessonId });

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const call = mockPrisma.userLessonProgress.upsert.mock.calls[0]![0]!;
            expect(call.create.isCompleted).toBe(true);
            expect(call.create.lessonId).toBe(mockLessonId);
            expect(call.create.userId).toBe('user-1');
            expect(call.create.completedAt).toBeInstanceOf(Date);
            expect(call.update.isCompleted).toBe(true);
        });
    });
});
