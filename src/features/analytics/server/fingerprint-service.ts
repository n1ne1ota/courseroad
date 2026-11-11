import 'server-only';

import type { DeviceFingerprint } from '@prisma/client';

import { createHash, randomUUID } from 'crypto';

import { prismaClient } from '@/server/db/client';

import type { EnrichedFingerprintSignals, FingerprintMatch } from '@/types/fingerprint.types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Weighted scores for each signal. Total = 100 */
const SIGNAL_WEIGHTS = {
    audioHash: 15,
    canvasHash: 35,
    deviceMemory: 5,
    fontsList: 2,
    hardwareConcurrency: 5,
    platform: 3,
    screenResolution: 10,
    timezone: 5,
    webgl: 20
} as const;

/** Minimum similarity score to consider a match */
const MATCH_THRESHOLD = 75;

/** Maximum number of fields allowed to drift per match cycle */
const MAX_DRIFT_PER_CYCLE = 3;

/** Maximum candidates to evaluate in the fallback pass */
const MAX_FALLBACK_CANDIDATES = 50;

// ---------------------------------------------------------------------------
// Hashing
// ---------------------------------------------------------------------------

/**
 * Generate a deterministic SHA-256 hash from a subset of signals.
 * Keys are sorted to guarantee determinism regardless of insertion order.
 */
function hashSignals(signals: Record<string, unknown>): string {
    const sorted = Object.keys(signals)
        .sort()
        .reduce<Record<string, unknown>>((acc, key) => {
            acc[key] = signals[key];
            return acc;
        }, {});

    return createHash('sha256').update(JSON.stringify(sorted)).digest('hex');
}

/**
 * Hash of high-stability hardware signals only.
 * Used as the primary fast-path index key.
 */
export function generateStableHash(signals: EnrichedFingerprintSignals): string {
    return hashSignals({
        colorDepth: signals.colorDepth,
        deviceMemory: signals.deviceMemory,
        hardwareConcurrency: signals.hardwareConcurrency,
        platform: signals.platform,
        screenHeight: signals.screenHeight,
        screenWidth: signals.screenWidth,
        timezone: signals.timezone
    });
}

/**
 * Hash of all fingerprint signals (hardware + biometric).
 * Used for exact-match deduplication before running fuzzy scoring.
 */
export function generateFullHash(signals: EnrichedFingerprintSignals): string {
    return hashSignals({
        audioHash: signals.audioHash,
        canvasHash: signals.canvasHash,
        colorDepth: signals.colorDepth,
        deviceMemory: signals.deviceMemory,
        fontsList: signals.fontsList,
        hardwareConcurrency: signals.hardwareConcurrency,
        platform: signals.platform,
        screenHeight: signals.screenHeight,
        screenWidth: signals.screenWidth,
        timezone: signals.timezone,
        webglRenderer: signals.webglRenderer,
        webglVendor: signals.webglVendor
    });
}

// ---------------------------------------------------------------------------
// Similarity helpers
// ---------------------------------------------------------------------------

/**
 * Jaccard similarity coefficient for two string arrays.
 * Returns intersection / union (0–1).
 */
export function calculateJaccardSimilarity(a: string[], b: string[]): number {
    const setA = new Set(a);
    const setB = new Set(b);

    let intersectionSize = 0;
    for (const item of setA) {
        if (setB.has(item)) intersectionSize++;
    }

    const unionSize = setA.size + setB.size - intersectionSize;
    if (unionSize === 0) return 1; // Both empty → identical

    return intersectionSize / unionSize;
}

// ---------------------------------------------------------------------------
// Core scoring algorithm
// ---------------------------------------------------------------------------

/**
 * Calculate weighted similarity between an incoming fingerprint and a stored record.
 *
 * Null signals on either side are skipped (not penalized).
 * The final score is normalized against the maximum achievable weight,
 * so missing APIs don't drag the score down.
 */
export function calculateSimilarity(
    incoming: EnrichedFingerprintSignals,
    stored: DeviceFingerprint
): { driftedFields: string[]; matchedFields: string[]; score: number } {
    let earnedWeight = 0;
    let maxWeight = 0;
    const matchedFields: string[] = [];
    const driftedFields: string[] = [];

    // --- Canvas Hash (35) ---
    if (incoming.canvasHash != null && stored.canvasHash != null) {
        maxWeight += SIGNAL_WEIGHTS.canvasHash;
        if (incoming.canvasHash === stored.canvasHash) {
            earnedWeight += SIGNAL_WEIGHTS.canvasHash;
            matchedFields.push('canvasHash');
        } else {
            driftedFields.push('canvasHash');
        }
    }

    // --- WebGL Renderer + Vendor (20 combined) ---
    if (incoming.webglRenderer != null && stored.webglRenderer != null) {
        const rendererWeight = 12;
        maxWeight += rendererWeight;
        if (incoming.webglRenderer === stored.webglRenderer) {
            earnedWeight += rendererWeight;
            matchedFields.push('webglRenderer');
        } else {
            driftedFields.push('webglRenderer');
        }
    }

    if (incoming.webglVendor != null && stored.webglVendor != null) {
        const vendorWeight = 8;
        maxWeight += vendorWeight;
        if (incoming.webglVendor === stored.webglVendor) {
            earnedWeight += vendorWeight;
            matchedFields.push('webglVendor');
        } else {
            driftedFields.push('webglVendor');
        }
    }

    // --- Audio Hash (15) ---
    if (incoming.audioHash != null && stored.audioHash != null) {
        maxWeight += SIGNAL_WEIGHTS.audioHash;
        if (incoming.audioHash === stored.audioHash) {
            earnedWeight += SIGNAL_WEIGHTS.audioHash;
            matchedFields.push('audioHash');
        } else {
            driftedFields.push('audioHash');
        }
    }

    // --- Screen Resolution (10) — width + height combined ---
    if (
        incoming.screenWidth != null &&
        incoming.screenHeight != null &&
        stored.screenWidth != null &&
        stored.screenHeight != null
    ) {
        maxWeight += SIGNAL_WEIGHTS.screenResolution;
        if (incoming.screenWidth === stored.screenWidth && incoming.screenHeight === stored.screenHeight) {
            earnedWeight += SIGNAL_WEIGHTS.screenResolution;
            matchedFields.push('screenResolution');
        } else {
            driftedFields.push('screenResolution');
        }
    }

    // --- Hardware Concurrency (5) ---
    if (incoming.hardwareConcurrency != null && stored.hardwareConcurrency != null) {
        maxWeight += SIGNAL_WEIGHTS.hardwareConcurrency;
        if (incoming.hardwareConcurrency === stored.hardwareConcurrency) {
            earnedWeight += SIGNAL_WEIGHTS.hardwareConcurrency;
            matchedFields.push('hardwareConcurrency');
        } else {
            driftedFields.push('hardwareConcurrency');
        }
    }

    // --- Device Memory (5) ---
    if (incoming.deviceMemory != null && stored.deviceMemory != null) {
        maxWeight += SIGNAL_WEIGHTS.deviceMemory;
        if (incoming.deviceMemory === stored.deviceMemory) {
            earnedWeight += SIGNAL_WEIGHTS.deviceMemory;
            matchedFields.push('deviceMemory');
        } else {
            driftedFields.push('deviceMemory');
        }
    }

    // --- Timezone (5) ---
    if (incoming.timezone != null && stored.timezone != null) {
        maxWeight += SIGNAL_WEIGHTS.timezone;
        if (incoming.timezone === stored.timezone) {
            earnedWeight += SIGNAL_WEIGHTS.timezone;
            matchedFields.push('timezone');
        } else {
            driftedFields.push('timezone');
        }
    }

    // --- Platform (3) ---
    if (incoming.platform != null && stored.platform != null) {
        maxWeight += SIGNAL_WEIGHTS.platform;
        if (incoming.platform === stored.platform) {
            earnedWeight += SIGNAL_WEIGHTS.platform;
            matchedFields.push('platform');
        } else {
            driftedFields.push('platform');
        }
    }

    // --- Fonts List (2) — Jaccard similarity ---
    if (incoming.fontsList != null && stored.fontsList != null) {
        maxWeight += SIGNAL_WEIGHTS.fontsList;
        const storedFonts: string[] = JSON.parse(stored.fontsList);
        const similarity = calculateJaccardSimilarity(incoming.fontsList, storedFonts);
        earnedWeight += SIGNAL_WEIGHTS.fontsList * similarity;

        if (similarity >= 0.9) {
            matchedFields.push('fontsList');
        } else {
            driftedFields.push('fontsList');
        }
    }

    // Normalize score to 0–100 based on what was actually comparable
    const score = maxWeight > 0 ? Math.round((earnedWeight / maxWeight) * 100) : 0;

    return { driftedFields, matchedFields, score };
}

// ---------------------------------------------------------------------------
// Candidate search
// ---------------------------------------------------------------------------

/**
 * Two-pass database search for fingerprint candidates.
 *
 * Pass 1: Exact match on stableHash (indexed, fast).
 * Pass 2: Fallback to platform + hardwareConcurrency, limited to 50 results.
 */
async function findCandidates(stableHash: string, signals: EnrichedFingerprintSignals): Promise<DeviceFingerprint[]> {
    // Pass 1: fast indexed lookup
    const exactMatches = await prismaClient.deviceFingerprint.findMany({
        where: { stableHash }
    });

    if (exactMatches.length > 0) return exactMatches;

    // Pass 2: broader fallback search
    return prismaClient.deviceFingerprint.findMany({
        take: MAX_FALLBACK_CANDIDATES,
        where: {
            ...(signals.hardwareConcurrency != null && {
                hardwareConcurrency: signals.hardwareConcurrency
            }),
            ...(signals.platform != null && { platform: signals.platform })
        }
    });
}

// ---------------------------------------------------------------------------
// Orchestration
// ---------------------------------------------------------------------------

/**
 * Main entry point: identify an existing visitor or create a new one.
 *
 * Pipeline: fullHash exact match → stableHash candidates → fuzzy score → drift budget → create/merge.
 */
export async function identifyOrCreateVisitor(
    signals: EnrichedFingerprintSignals,
    userId?: string
): Promise<FingerprintMatch> {
    const stableHash = generateStableHash(signals);
    const fullHash = generateFullHash(signals);
    const fontsJson = signals.fontsList ? JSON.stringify(signals.fontsList) : null;

    // --- Fast path: exact fullHash match ---
    const exactMatch = await prismaClient.deviceFingerprint.findFirst({
        where: { fullHash }
    });

    if (exactMatch) {
        await prismaClient.deviceFingerprint.update({
            data: {
                lastSeenAt: new Date(),
                ...(userId && { userId })
            },
            where: { id: exactMatch.id }
        });

        return {
            driftedFields: [],
            isNew: false,
            matchedFields: ['fullHash'],
            score: 100,
            visitorId: exactMatch.visitorId
        };
    }

    // --- Candidate search + fuzzy scoring ---
    const candidates = await findCandidates(stableHash, signals);

    let bestMatch: {
        driftedFields: string[];
        matchedFields: string[];
        record: DeviceFingerprint;
        score: number;
    } | null = null;

    for (const candidate of candidates) {
        const result = calculateSimilarity(signals, candidate);

        if (result.score >= MATCH_THRESHOLD) {
            if (!bestMatch || result.score > bestMatch.score) {
                bestMatch = { ...result, record: candidate };
            }
        }
    }

    // --- Match found: check drift budget ---
    if (bestMatch && bestMatch.driftedFields.length <= MAX_DRIFT_PER_CYCLE) {
        await prismaClient.deviceFingerprint.update({
            data: {
                acceptLanguage: signals.acceptLanguage,
                audioHash: signals.audioHash,
                canvasHash: signals.canvasHash,
                colorDepth: signals.colorDepth,
                deviceMemory: signals.deviceMemory,
                driftCount: bestMatch.record.driftCount + bestMatch.driftedFields.length,
                fontsList: fontsJson,
                fullHash,
                hardwareConcurrency: signals.hardwareConcurrency,
                ipAddress: signals.ipAddress,
                lastScore: bestMatch.score,
                lastSeenAt: new Date(),
                platform: signals.platform,
                screenHeight: signals.screenHeight,
                screenWidth: signals.screenWidth,
                stableHash,
                timezone: signals.timezone,
                userAgent: signals.userAgent,
                webglRenderer: signals.webglRenderer,
                webglVendor: signals.webglVendor,
                ...(userId && { userId })
            },
            where: { id: bestMatch.record.id }
        });

        return {
            driftedFields: bestMatch.driftedFields,
            isNew: false,
            matchedFields: bestMatch.matchedFields,
            score: bestMatch.score,
            visitorId: bestMatch.record.visitorId
        };
    }

    // --- No match or drift budget exceeded: create new visitor ---
    const visitorId = randomUUID();

    await prismaClient.deviceFingerprint.create({
        data: {
            acceptLanguage: signals.acceptLanguage,
            audioHash: signals.audioHash,
            canvasHash: signals.canvasHash,
            colorDepth: signals.colorDepth,
            deviceMemory: signals.deviceMemory,
            fontsList: fontsJson,
            fullHash,
            hardwareConcurrency: signals.hardwareConcurrency,
            ipAddress: signals.ipAddress,
            lastScore: bestMatch?.score ?? 0,
            platform: signals.platform,
            screenHeight: signals.screenHeight,
            screenWidth: signals.screenWidth,
            stableHash,
            timezone: signals.timezone,
            userAgent: signals.userAgent,
            visitorId,
            webglRenderer: signals.webglRenderer,
            webglVendor: signals.webglVendor,
            ...(userId && { userId })
        }
    });

    return {
        driftedFields: bestMatch?.driftedFields ?? [],
        isNew: true,
        matchedFields: [],
        score: bestMatch?.score ?? 0,
        visitorId
    };
}
