import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const mockQuery = vi.fn();

/**
 * Simulates a Prisma client with `$extends`. When the extension is applied,
 * `$allOperations` is called for each model operation. We capture the
 * rewritten args via `mockQuery`.
 */
function createFakePrisma() {
    return {
        $extends(extension: {
            query: {
                $allModels: {
                    $allOperations: (ctx: {
                        args: Record<string, unknown>;
                        model: string;
                        operation: string;
                        query: typeof mockQuery;
                    }) => unknown;
                };
            };
        }) {
            // Return a proxy that, when any model.operation is called,
            // invokes the extension's $allOperations with the right params.
            return new Proxy(
                {},
                {
                    get(_target, model: string) {
                        return new Proxy(
                            {},
                            {
                                get(_t2, operation: string) {
                                    return (args: Record<string, unknown>) =>
                                        extension.query.$allModels.$allOperations({
                                            args,
                                            model,
                                            operation,
                                            query: mockQuery
                                        });
                                }
                            }
                        );
                    }
                }
            );
        }
    };
}

const { withTenantScope } = await import('@/server/db/tenant');

const TEST_ORG_ID = 'org-test-123';

describe('withTenantScope', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockQuery.mockResolvedValue([]);
    });

    // Global model bypass
    describe('Given a global model', () => {
        it('passes User queries through without injecting organizationId', async () => {
            const fakePrisma = createFakePrisma();
            const scoped = withTenantScope(fakePrisma as never, TEST_ORG_ID);
            const where = { id: 'user-1' };

            await (scoped as any).User.findUnique({
                where
            });

            expect(mockQuery).toHaveBeenCalledWith({ where });
        });

        it.each(['Session', 'Account', 'Organization', 'Verification', 'StripeEvent'])(
            'bypasses %s without modification',
            async model => {
                const fakePrisma = createFakePrisma();
                const scoped = withTenantScope(fakePrisma as never, TEST_ORG_ID);
                const args = { where: { id: '1' } };

                await (scoped as any)[model].findUnique(args);

                expect(mockQuery).toHaveBeenCalledWith(args);
            }
        );
    });

    // Read operations: where injection
    describe('Given a tenant-scoped model with a read operation', () => {
        it('injects organizationId into the where clause for findMany', async () => {
            const fakePrisma = createFakePrisma();
            const scoped = withTenantScope(fakePrisma as never, TEST_ORG_ID);

            await (scoped as any).Course.findMany({
                where: { userId: 'u-1' }
            });

            expect(mockQuery).toHaveBeenCalledWith({
                where: { organizationId: TEST_ORG_ID, userId: 'u-1' }
            });
        });

        it('creates a where clause when none exists', async () => {
            const fakePrisma = createFakePrisma();
            const scoped = withTenantScope(fakePrisma as never, TEST_ORG_ID);

            await (scoped as any).Quiz.findMany({});

            expect(mockQuery).toHaveBeenCalledWith({
                where: { organizationId: TEST_ORG_ID }
            });
        });

        it('injects organizationId for update operations', async () => {
            const fakePrisma = createFakePrisma();
            const scoped = withTenantScope(fakePrisma as never, TEST_ORG_ID);

            await (scoped as any).Lesson.update({
                data: { title: 'new' },
                where: { id: 'l-1' }
            });

            expect(mockQuery).toHaveBeenCalledWith({
                data: { title: 'new' },
                where: { id: 'l-1', organizationId: TEST_ORG_ID }
            });
        });

        it('injects organizationId for delete operations', async () => {
            const fakePrisma = createFakePrisma();
            const scoped = withTenantScope(fakePrisma as never, TEST_ORG_ID);

            await (scoped as any).Module.delete({
                where: { id: 'm-1' }
            });

            expect(mockQuery).toHaveBeenCalledWith({
                where: { id: 'm-1', organizationId: TEST_ORG_ID }
            });
        });
    });

    // Write operations: data injection
    describe('Given a tenant-scoped model with a create operation', () => {
        it('injects organizationId into the data payload', async () => {
            const fakePrisma = createFakePrisma();
            const scoped = withTenantScope(fakePrisma as never, TEST_ORG_ID);

            await (scoped as any).Course.create({
                data: { title: 'New Course', userId: 'u-1' }
            });

            expect(mockQuery).toHaveBeenCalledWith({
                data: { organizationId: TEST_ORG_ID, title: 'New Course', userId: 'u-1' }
            });
        });

        it('injects organizationId into each item for createMany', async () => {
            const fakePrisma = createFakePrisma();
            const scoped = withTenantScope(fakePrisma as never, TEST_ORG_ID);

            await (scoped as any).Lesson.createMany({
                data: [
                    { moduleId: 'm-1', title: 'L1' },
                    { moduleId: 'm-1', title: 'L2' }
                ]
            });

            expect(mockQuery).toHaveBeenCalledWith({
                data: [
                    { moduleId: 'm-1', organizationId: TEST_ORG_ID, title: 'L1' },
                    { moduleId: 'm-1', organizationId: TEST_ORG_ID, title: 'L2' }
                ]
            });
        });
    });

    // Edge: null model
    describe('Given a null model', () => {
        it('passes through without injection', async () => {
            const fakePrisma = createFakePrisma();
            const scoped = withTenantScope(fakePrisma as never, TEST_ORG_ID);

            // Simulate a raw query where model is undefined
            const handler = (scoped as any)['']?.['findMany'];

            if (handler) await handler({ where: {} });
        });
    });

    // B2C context bypass
    describe('Given a null or empty organizationId (B2C context)', () => {
        it('bypasses scoping logic entirely and executes the query unmodified', async () => {
            const fakePrisma = createFakePrisma();
            const scoped = withTenantScope(fakePrisma as never, undefined);
            const where = { userId: 'u-1' };

            await (scoped as any).Course.findMany({
                where
            });

            expect(mockQuery).toHaveBeenCalledWith({ where });
        });
    });
});
