/**
 * Shared types for the auth domain module.
 */

import type { Prisma } from '@prisma/client';

/** User info returned by batch user lookups. */
export type UserInfo = {
    firstName: string | null;
    id: string;
    lastName: string | null;
};

/**
 * Structural type that accepts both the base PrismaClient and
 * tenant-scoped extended clients (DynamicClientExtensionThis).
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export type PrismaLike = {
    user: Prisma.UserDelegate<any>;
};
/* eslint-enable @typescript-eslint/no-explicit-any */
