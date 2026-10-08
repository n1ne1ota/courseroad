import { vi } from 'vitest';

/**
 * Shared Prisma mock factory for server action tests.
 * Each model method returns a vi.fn() that can be configured per-test.
 */
export function createMockPrismaClient() {
    return {
        $transaction: vi.fn(async (fns: unknown[]) => {
            if (Array.isArray(fns)) {
                return Promise.all(fns);
            }
            return fns;
        }),
        course: {
            count: vi.fn(),
            create: vi.fn(),
            delete: vi.fn(),
            findFirst: vi.fn(),
            findMany: vi.fn(),
            findUnique: vi.fn(),
            update: vi.fn()
        },
        enrollment: {
            count: vi.fn(),
            create: vi.fn(),
            findMany: vi.fn(),
            findUnique: vi.fn(),
            upsert: vi.fn()
        },
        invitation: {
            create: vi.fn(),
            findFirst: vi.fn(),
            findMany: vi.fn(),
            findUnique: vi.fn(),
            update: vi.fn()
        },
        lesson: {
            count: vi.fn(),
            create: vi.fn(),
            delete: vi.fn(),
            findFirst: vi.fn(),
            findUnique: vi.fn(),
            update: vi.fn()
        },
        member: {
            create: vi.fn(),
            findFirst: vi.fn(),
            findMany: vi.fn(),
            findUnique: vi.fn(),
            update: vi.fn(),
            upsert: vi.fn()
        },
        module: {
            count: vi.fn(),
            create: vi.fn(),
            delete: vi.fn(),
            findFirst: vi.fn(),
            findUnique: vi.fn(),
            update: vi.fn()
        },
        organization: {
            create: vi.fn(),
            findFirst: vi.fn(),
            findMany: vi.fn(),
            findUnique: vi.fn(),
            update: vi.fn(),
            upsert: vi.fn()
        },
        quiz: {
            create: vi.fn(),
            findMany: vi.fn(),
            findUnique: vi.fn(),
            update: vi.fn()
        },
        quizSubmission: {
            count: vi.fn(),
            create: vi.fn()
        },
        user: {
            findFirst: vi.fn(),
            findMany: vi.fn(),
            findUnique: vi.fn(),
            update: vi.fn()
        },
        userLessonProgress: {
            findMany: vi.fn(),
            upsert: vi.fn()
        }
    };
}

export type MockPrismaClient = ReturnType<typeof createMockPrismaClient>;
