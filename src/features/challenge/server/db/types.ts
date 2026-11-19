import 'server-only';
/** @internal Repository API; application callers use authorized feature DALs. */
/**
 * Shared types for the challenges domain module.
 */

import type { Prisma } from '@prisma/client';

/**
 * Structural type that accepts both the base PrismaClient and
 * tenant-scoped extended clients (DynamicClientExtensionThis).
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export type PrismaLike = {
    codingChallenge: Prisma.CodingChallengeDelegate<any>;
};
/* eslint-enable @typescript-eslint/no-explicit-any */
