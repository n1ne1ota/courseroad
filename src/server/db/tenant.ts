import 'server-only';

import type { PrismaClient } from '@prisma/client';

/**
 * Models that are global (not scoped to an organization).
 * Queries on these models bypass tenant filtering entirely.
 */
const GLOBAL_MODELS = new Set([
    'Account',
    'DeviceFingerprint',
    'Invitation',
    'Member',
    'Organization',
    'Session',
    'StripeEvent',
    'User',
    'Verification'
]);

/**
 * Operations where `organizationId` is injected into the data payload
 * rather than the where clause.
 */
const WRITE_OPERATIONS = new Set(['create', 'createMany', 'createManyAndReturn']);

/**
 * Wraps a Prisma client instance with automatic tenant scoping.
 *
 * For tenant-scoped models (any model not in `GLOBAL_MODELS`), this
 * extension injects `organizationId` into:
 * - `where` clauses for reads, updates, deletes, counts, and aggregations
 * - `data` payloads for creates
 *
 * Global models (User, Session, Account, etc.) pass through unmodified.
 */
export function withTenantScope<T extends PrismaClient>(prisma: T, organizationId?: string | null) {
    return prisma.$extends({
        query: {
            $allModels: {
                async $allOperations({ args, model, operation, query }) {
                    if (!model || GLOBAL_MODELS.has(model)) return query(args);
                    if (!organizationId) return query(args);

                    if (WRITE_OPERATIONS.has(operation)) {
                        const writeArgs = args as { data?: Record<string, unknown> };

                        if (operation === 'createMany' || operation === 'createManyAndReturn') {
                            // createMany receives { data: array }
                            const manyArgs = args as { data?: Record<string, unknown>[] };
                            if (Array.isArray(manyArgs.data)) {
                                manyArgs.data = manyArgs.data.map(item => ({
                                    ...item,
                                    organizationId
                                }));
                            }
                        } else if (writeArgs.data && typeof writeArgs.data === 'object') {
                            writeArgs.data = { ...writeArgs.data, organizationId };
                        }

                        return query(args);
                    }

                    // Read, update, delete, count, aggregate, groupBy: inject into where
                    const readArgs = args as { where?: Record<string, unknown> };
                    readArgs.where = { ...readArgs.where, organizationId };

                    return query(args);
                }
            }
        }
    });
}
