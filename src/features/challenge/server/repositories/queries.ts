import 'server-only';

/** @internal Repository API; application callers use authorized feature DALs. */
import type { PrismaLike } from '@/features/challenge/server/repositories/types';

/**
 * Fetch a coding challenge by ID.
 */
export async function getChallengeById(prisma: PrismaLike, challengeId: string) {
    return prisma.codingChallenge.findUnique({
        where: { id: challengeId }
    });
}

/**
 * Fetch all challenges for a specific user.
 */
export async function getChallengesByUserId(prisma: PrismaLike, userId: string) {
    return prisma.codingChallenge.findMany({
        orderBy: { createdAt: 'desc' as const },
        where: { userId }
    });
}
