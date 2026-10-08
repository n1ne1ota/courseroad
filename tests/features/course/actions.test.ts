import { createMockPrismaClient, type MockPrismaClient } from 'tests/mocks/prisma';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock next/cache
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
    revalidateTag: vi.fn()
}));

// Mock next/navigation
const mockRedirect = vi.fn();
vi.mock('next/navigation', () => ({
    redirect: (url: string) => {
        mockRedirect(url);
        throw new Error(`NEXT_REDIRECT:${url}`);
    }
}));

// Mock next/headers
vi.mock('next/headers', () => ({
    headers: vi.fn().mockResolvedValue(new Headers())
}));

// Mock logger
vi.mock('@/server/logging/server', () => ({
    log: { error: vi.fn() },
    logs: { db: { error: vi.fn(), info: vi.fn(), warn: vi.fn() } }
}));
// Mock requireOrgRole
const mockRequireOrgRole = vi.fn();
vi.mock('@/server/auth/organization-context', () => ({
    getOrganizationContext: (_slug: unknown, role: string) => mockRequireOrgRole(role)
}));

// Mock tenant-scoped Prisma client
let mockPrisma: MockPrismaClient;
vi.mock('@/server/db/get-tenant-prisma', () => {
    const mock = createMockPrismaClient();
    // Store the reference so tests can configure it
    mockPrisma = mock;
    return { getTenantPrisma: vi.fn().mockResolvedValue(mock) };
});

// Import after all mocks are set up
const { createCourse, updateCourse } = await import('@/features/course/actions/course-actions');

const mockUser = { id: 'user-1', role: 'creator' };

describe('Course Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockRequireOrgRole.mockResolvedValue({
            member: { role: 'creator' },
            organizationId: 'test-org',
            organizationSlug: 'test-org',
            user: mockUser
        });
    });

    describe('createCourse', () => {
        describe('Given an unauthenticated user', () => {
            it('returns an error message', async () => {
                mockRequireOrgRole.mockImplementation(() => {
                    throw new Error('NEXT_REDIRECT:/sign-in');
                });

                await expect(createCourse({ error: '', success: false }, { title: 'Test Course' })).rejects.toThrow(
                    'NEXT_REDIRECT:/sign-in'
                );
            });
        });

        describe('Given a user without teacher/admin role', () => {
            it('returns an unauthorized error', async () => {
                mockRequireOrgRole.mockImplementation(() => {
                    throw new Error('NEXT_REDIRECT:/');
                });

                await expect(createCourse({ error: '', success: false }, { title: 'Test Course' })).rejects.toThrow(
                    'NEXT_REDIRECT:/'
                );
            });
        });

        describe('Given invalid form data', () => {
            it('returns validation errors for missing title', async () => {
                const result = await createCourse(
                    { error: '', success: false },
                    {} as any // No title
                );

                expect(result.success).toBe(false);
                expect(result.error).toBe('Validation failed');
                expect(result.fieldErrors).toBeDefined();
            });
        });

        describe('Given a duplicate course slug', () => {
            it('returns a duplicate error', async () => {
                mockPrisma.course.findUnique.mockResolvedValue({
                    id: 'existing-course',
                    slug: 'test-course',
                    userId: 'user-1'
                });

                const result = await createCourse({ error: '', success: false }, { title: 'Test Course' });

                expect(result.success).toBe(false);
                expect(result.error).toContain('already exists');
            });
        });

        describe('Given valid data', () => {
            it('creates the course and redirects', async () => {
                mockPrisma.course.findUnique.mockResolvedValue(null);
                mockPrisma.course.create.mockResolvedValue({
                    id: 'new-course-id',
                    slug: 'test-course',
                    title: 'Test Course',
                    userId: 'user-1'
                });

                await expect(createCourse({ error: '', success: false }, { title: 'Test Course' })).rejects.toThrow(
                    'NEXT_REDIRECT'
                );

                expect(mockPrisma.course.create).toHaveBeenCalledWith(
                    expect.objectContaining({
                        data: expect.objectContaining({
                            slug: 'test-course',
                            title: 'Test Course',
                            userId: 'user-1'
                        })
                    })
                );

                expect(mockRedirect).toHaveBeenCalledWith(
                    '/organization/test-org/creator/dashboard/courses/new-course-id'
                );
            });

            it('auto-generates a slug from the title', async () => {
                mockPrisma.course.findUnique.mockResolvedValue(null);
                mockPrisma.course.create.mockResolvedValue({
                    id: 'course-2',
                    slug: 'my-awesome-course',
                    title: 'My Awesome Course!',
                    userId: 'user-1'
                });

                await expect(
                    createCourse({ error: '', success: false }, { title: 'My Awesome Course!' })
                ).rejects.toThrow('NEXT_REDIRECT');

                expect(mockPrisma.course.create).toHaveBeenCalledWith(
                    expect.objectContaining({
                        data: expect.objectContaining({
                            slug: 'my-awesome-course'
                        })
                    })
                );
            });
        });
    });

    describe('updateCourse', () => {
        describe('Given an unauthenticated user', () => {
            it('returns an error message', async () => {
                mockRequireOrgRole.mockImplementation(() => {
                    throw new Error('NEXT_REDIRECT:/sign-in');
                });

                await expect(
                    updateCourse(
                        { error: '', success: false },
                        { id: '6169dd97-6e34-4539-a270-519d2e483790', title: 'Updated' }
                    )
                ).rejects.toThrow('NEXT_REDIRECT:/sign-in');
            });
        });

        describe('Given a nonexistent course', () => {
            it('returns a not-found error', async () => {
                mockPrisma.course.findUnique.mockResolvedValue(null);

                const result = await updateCourse(
                    { error: '', success: false },
                    { id: '6169dd97-6e34-4539-a270-519d2e483790', title: 'Updated' }
                );

                expect(result.success).toBe(false);
                expect(result.error).toBe('Course not found');
            });
        });

        describe('Given a course owned by another user', () => {
            it('returns an unauthorized error', async () => {
                mockPrisma.course.findUnique.mockResolvedValue({
                    id: '6169dd97-6e34-4539-a270-519d2e483790',
                    userId: 'other-user'
                });

                const result = await updateCourse(
                    { error: '', success: false },
                    { id: '6169dd97-6e34-4539-a270-519d2e483790', title: 'Updated' }
                );

                expect(result.success).toBe(false);
                expect(result.error).toContain('You do not');
            });
        });

        describe('Given valid update data', () => {
            it('updates the course and returns success', async () => {
                const courseUuid = '6169dd97-6e34-4539-a270-519d2e483790';
                // First findUnique for the course
                mockPrisma.course.findUnique
                    .mockResolvedValueOnce({ id: courseUuid, slug: 'old-slug', userId: 'user-1' })
                    // Second findUnique for slug check
                    .mockResolvedValueOnce(null);

                mockPrisma.course.update.mockResolvedValue({
                    id: courseUuid,
                    slug: 'updated-title',
                    title: 'Updated Title'
                });

                const result = await updateCourse(
                    { error: '', success: false },
                    { id: courseUuid, title: 'Updated Title' }
                );

                expect(result.success).toBe(true);
                expect(result.data).toBe(true);
                expect(mockPrisma.course.update).toHaveBeenCalled();
            });
        });
    });
});
