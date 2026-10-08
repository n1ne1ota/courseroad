import 'server-only';

import { connection } from 'next/server';

import { subDays } from 'date-fns';

import { getPlatformUser } from '@/server/auth/session';
import { prismaClient } from '@/server/db/client';

/**
 * Returns top-level aggregated metrics for the device fingerprinting engine.
 */
export async function getFingerprintMetrics() {
    await getPlatformUser('admin');
    await connection();
    const [totalDevices, active24h, active7d, driftAgg] = await Promise.all([
        prismaClient.deviceFingerprint.count(),
        prismaClient.deviceFingerprint.count({
            where: { lastSeenAt: { gte: subDays(new Date(), 1) } }
        }),
        prismaClient.deviceFingerprint.count({
            where: { lastSeenAt: { gte: subDays(new Date(), 7) } }
        }),
        prismaClient.deviceFingerprint.aggregate({
            _avg: { driftCount: true }
        })
    ]);

    return {
        active7d,
        active24h,
        averageDrift: driftAgg._avg.driftCount ? Number(driftAgg._avg.driftCount.toFixed(2)) : 0,
        totalDevices
    };
}

/**
 * Retrieves a paginated list of the most recent visitors.
 * Selects only fields necessary for the dashboard table UI.
 */
export async function getRecentVisitors(limit: number = 50, offset: number = 0) {
    await getPlatformUser('admin');
    await connection();
    return prismaClient.deviceFingerprint.findMany({
        orderBy: { lastSeenAt: 'desc' },
        select: {
            driftCount: true,
            firstSeenAt: true,
            hardwareConcurrency: true,
            id: true,
            ipAddress: true,
            lastScore: true,
            lastSeenAt: true,
            platform: true,
            visitorId: true
        },
        skip: offset,
        take: limit
    });
}

/**
 * Retrieves the full raw device fingerprint record for deep inspection.
 */
export async function getVisitorSignals(visitorId: string) {
    await getPlatformUser('admin');
    await connection();
    return prismaClient.deviceFingerprint.findUnique({
        where: { visitorId }
    });
}

/**
 * Aggregates device activity grouped by day over a given number of days.
 * Groups based on `lastSeenAt` to show rolling active device trends.
 */
export async function getVisitorsOverTime(days: number = 30) {
    await getPlatformUser('admin');
    await connection();
    const cutoff = subDays(new Date(), days);

    // Fetch the recent hits. To avoid DB-specific raw SQL date truncation,
    // we fetch and bucket in-memory for the admin dashboard.
    const rawVisits = await prismaClient.deviceFingerprint.findMany({
        orderBy: { lastSeenAt: 'asc' },
        select: { lastSeenAt: true },
        where: { lastSeenAt: { gte: cutoff } }
    });

    const grouped = rawVisits.reduce<Record<string, number>>(
        (acc: Record<string, number>, current: { lastSeenAt: Date }) => {
            // Use ISO string "YYYY-MM-DD" as bucket key
            const dateKey = current.lastSeenAt.toISOString().substring(0, 10);
            acc[dateKey] = (acc[dateKey] || 0) + 1;
            return acc;
        },
        {}
    );

    // Ensure we send back an array sorted chronologically
    return Object.entries(grouped)
        .map(([date, count]) => ({ count, date }))
        .sort((a, b) => a.date.localeCompare(b.date));
}
