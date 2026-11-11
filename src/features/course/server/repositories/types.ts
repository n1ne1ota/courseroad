import 'server-only';
/** @internal Repository API; application callers use authorized feature DALs. */
/**
 * Shared creator and client types for the courses domain module.
 */

import type { Prisma } from '@prisma/client';

/** Creator info returned by batch creator lookups. */
export type CreatorInfo = {
    id: string;
    firstName: string | null;
    lastName: string | null;
};

/**
 * Structural type that accepts both the base PrismaClient and
 * tenant-scoped extended clients (DynamicClientExtensionThis).
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export type PrismaLike = {
    course: Prisma.CourseDelegate<any>;
    enrollment: Prisma.EnrollmentDelegate<any>;
    lesson: Prisma.LessonDelegate<any>;
    module: Prisma.ModuleDelegate<any>;
    userLessonProgress: Prisma.UserLessonProgressDelegate<any>;
    $transaction: {
        <T>(promises: Array<any>): Promise<T[]>;
        <T>(fn: (tx: any) => Promise<T>): Promise<T>;
    };
};
/* eslint-enable @typescript-eslint/no-explicit-any */
