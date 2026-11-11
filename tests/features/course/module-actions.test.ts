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
vi.mock('next/navigation', () => ({
    redirect: (url: string) => {
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
    mockPrisma = mock;
    return { getTenantPrisma: vi.fn().mockResolvedValue(mock) };
});

const { createModule, deleteModule, reorderModules, updateModule } =
    await import('@/features/course/actions/module-actions');

const COURSE_ID = '11111111-1111-4111-8111-111111111111';
const MODULE_1_ID = '22222222-2222-4222-8222-222222222222';
const MODULE_2_ID = '33333333-3333-4333-8333-333333333333';
const NONEXISTENT_ID = '44444444-4444-4444-8444-444444444444';

const mockUser = { id: 'user-1', role: 'creator' };

describe('Module Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockRequireOrgRole.mockResolvedValue({
            member: { role: 'creator' },
            organizationId: '',
            user: mockUser
        });
    });

    describe('createModule', () => {
        describe('Given an unauthorized user (non-owner)', () => {
            it('throws when course is not found', async () => {
                mockPrisma.course.findUnique.mockResolvedValue(null);

                const res = await createModule({ courseId: COURSE_ID, title: 'Module 1' });
                expect(res.error).toContain('Unauthorized');
            });

            it('throws when user does not own the course', async () => {
                mockPrisma.course.findUnique.mockResolvedValue({ id: COURSE_ID, userId: 'other-user' });

                const res = await createModule({ courseId: COURSE_ID, title: 'Module 1' });
                expect(res.error).toContain('Unauthorized');
            });
        });

        describe('Given a valid request', () => {
            it('creates the module with order 1 when no modules exist', async () => {
                mockPrisma.course.findUnique.mockResolvedValue({ id: COURSE_ID, userId: 'user-1' });
                mockPrisma.module.findFirst.mockResolvedValue(null);
                mockPrisma.module.create.mockResolvedValue({
                    courseId: COURSE_ID,
                    id: MODULE_1_ID,
                    order: 1,
                    title: 'Module 1'
                });

                const result = await createModule({ courseId: COURSE_ID, title: 'Module 1' });

                expect(result.data).toEqual(expect.objectContaining({ id: MODULE_1_ID, order: 1 }));
                expect(mockPrisma.module.create).toHaveBeenCalledWith(
                    expect.objectContaining({
                        data: { courseId: COURSE_ID, order: 1, organizationId: '', title: 'Module 1' }
                    })
                );
            });

            it('increments order based on the last existing module', async () => {
                mockPrisma.course.findUnique.mockResolvedValue({ id: COURSE_ID, userId: 'user-1' });
                mockPrisma.module.findFirst.mockResolvedValue({ order: 3 });
                mockPrisma.module.create.mockResolvedValue({
                    courseId: COURSE_ID,
                    id: MODULE_2_ID,
                    order: 4,
                    title: 'Module 4'
                });

                await createModule({ courseId: COURSE_ID, title: 'Module 4' });

                expect(mockPrisma.module.create).toHaveBeenCalledWith(
                    expect.objectContaining({
                        data: expect.objectContaining({ order: 4 })
                    })
                );
            });
        });
    });

    describe('updateModule', () => {
        describe('Given a module owned by the user', () => {
            it('updates the title and returns the updated module', async () => {
                mockPrisma.module.findUnique.mockResolvedValue({
                    course: { userId: 'user-1' },
                    courseId: COURSE_ID,
                    id: MODULE_1_ID
                });
                mockPrisma.module.update.mockResolvedValue({
                    id: MODULE_1_ID,
                    title: 'Updated Title'
                });

                const result = await updateModule({ moduleId: MODULE_1_ID, title: 'Updated Title' });

                expect(result.data).toEqual(expect.objectContaining({ title: 'Updated Title' }));
                expect(mockPrisma.module.update).toHaveBeenCalledWith({
                    data: { title: 'Updated Title' },
                    where: { id: MODULE_1_ID }
                });
            });
        });

        describe('Given a module not owned by the user', () => {
            it('throws an error', async () => {
                mockPrisma.module.findUnique.mockResolvedValue({
                    course: { userId: 'other-user' },
                    id: MODULE_1_ID
                });

                const res = await updateModule({ moduleId: MODULE_1_ID, title: 'New Title' });
                expect(res.error).toContain('Unauthorized');
            });
        });
    });

    describe('deleteModule', () => {
        describe('Given a module owned by the user', () => {
            it('deletes the module', async () => {
                mockPrisma.module.findUnique.mockResolvedValue({
                    course: { userId: 'user-1' },
                    courseId: COURSE_ID,
                    id: MODULE_1_ID
                });
                mockPrisma.module.delete.mockResolvedValue({ id: MODULE_1_ID });

                await deleteModule({ moduleId: MODULE_1_ID });

                expect(mockPrisma.module.delete).toHaveBeenCalledWith({
                    where: { id: MODULE_1_ID }
                });
            });
        });

        describe('Given a nonexistent module', () => {
            it('throws an error', async () => {
                mockPrisma.module.findUnique.mockResolvedValue(null);

                const res = await deleteModule({ moduleId: NONEXISTENT_ID });
                expect(res.error).toContain('Unauthorized');
            });
        });
    });

    describe('reorderModules', () => {
        describe('Given valid reorder data', () => {
            it('uses a transaction to update positions', async () => {
                mockPrisma.module.findUnique.mockResolvedValue({
                    course: { userId: 'user-1' },
                    courseId: COURSE_ID,
                    id: MODULE_1_ID
                });
                mockPrisma.module.update.mockResolvedValue({});

                await reorderModules([
                    { id: MODULE_1_ID, position: 2 },
                    { id: MODULE_2_ID, position: 1 }
                ]);

                expect(mockPrisma.$transaction).toHaveBeenCalled();
            });
        });

        describe('Given an empty array', () => {
            it('returns early without error', async () => {
                await reorderModules([]);

                expect(mockPrisma.module.findUnique).not.toHaveBeenCalled();
            });
        });
    });
});
