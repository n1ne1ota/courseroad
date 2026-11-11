import 'server-only';

import { cookies, headers } from 'next/headers';

import { rawFingerprintSchema } from '@/features/analytics/schemas';
import { identifyOrCreateVisitor } from '@/features/analytics/server/fingerprint-service';
import { createSafeAction } from '@/server/actions/create-safe-action';
import { prismaClient } from '@/server/db/client';
import { logs } from '@/server/logging/server';

import type { EnrichedFingerprintSignals } from '@/types/fingerprint.types';

/** Cookie name for the persistent visitor identifier */
const VISITOR_COOKIE_NAME = 'internal_visitor_id';

/** Cookie max age: 365 days in seconds */
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/**
 * Server Action: Identify a device via browser fingerprint signals.
 *
 * Pipeline:
 * 1. Validate incoming payload with Zod
 * 2. Enrich with server-side headers (IP, UA, Accept-Language)
 * 3. Fast path: if valid cookie exists, refresh and return early
 * 4. Slow path: run fuzzy matching engine
 * 5. Set HTTP-only cookie with visitorId
 */
export const identifyDevice = createSafeAction(rawFingerprintSchema, async validatedData => {
    // 2. Enrich with server-side headers
    const headerStore = await headers();
    const ipAddress = headerStore.get('x-forwarded-for')?.split(',')[0]?.trim() ?? headerStore.get('x-real-ip') ?? null;
    const userAgent = headerStore.get('user-agent') ?? null;
    const acceptLanguage = headerStore.get('accept-language') ?? null;

    const enrichedSignals: EnrichedFingerprintSignals = {
        ...validatedData,
        acceptLanguage,
        ipAddress,
        userAgent
    };

    // 3. Fast path: existing cookie
    const cookieStore = await cookies();
    const existingVisitorId = cookieStore.get(VISITOR_COOKIE_NAME)?.value;

    if (existingVisitorId) {
        const existing = await prismaClient.deviceFingerprint.findUnique({
            where: { visitorId: existingVisitorId }
        });

        if (existing) {
            // Refresh cookie and update lastSeenAt
            await prismaClient.deviceFingerprint.update({
                data: {
                    ipAddress,
                    lastSeenAt: new Date(),
                    userAgent
                },
                where: { id: existing.id }
            });

            cookieStore.set(VISITOR_COOKIE_NAME, existingVisitorId, {
                httpOnly: true,
                maxAge: COOKIE_MAX_AGE,
                path: '/',
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production'
            });

            return { visitorId: existingVisitorId };
        }
    }

    // 4. Slow path: fuzzy matching engine
    const match = await identifyOrCreateVisitor(enrichedSignals);

    // 5. Set cookie
    cookieStore.set(VISITOR_COOKIE_NAME, match.visitorId, {
        httpOnly: true,
        maxAge: COOKIE_MAX_AGE,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
    });

    logs.api.info('Fingerprint: device identified', {
        component: 'fingerprint',
        isNew: match.isNew,
        score: match.score,
        visitorId: match.visitorId
    });

    return { visitorId: match.visitorId };
});
