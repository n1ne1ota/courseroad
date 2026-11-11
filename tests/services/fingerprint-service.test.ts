import type { DeviceFingerprint } from '@prisma/client';

import { describe, expect, it, vi } from 'vitest';

import type { EnrichedFingerprintSignals } from '@/types/fingerprint.types';

// Mock server-only (throws in non-server environments)
vi.mock('server-only', () => ({}));

// Mock Prisma client
const mockPrisma = {
    deviceFingerprint: {
        create: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn()
    }
};
vi.mock('@/server/db/client', () => ({
    prismaClient: mockPrisma
}));

// Import AFTER mocks are set up
const {
    calculateJaccardSimilarity,
    calculateSimilarity,
    generateFullHash,
    generateStableHash,
    identifyOrCreateVisitor
} = await import('@/features/analytics/server/fingerprint-service');

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

function createSignals(overrides: Partial<EnrichedFingerprintSignals> = {}): EnrichedFingerprintSignals {
    return {
        acceptLanguage: 'en-US',
        audioHash: 'audio-hash-abc',
        canvasHash: 'canvas-hash-xyz',
        colorDepth: 24,
        deviceMemory: 8,
        fontsList: ['Arial', 'Helvetica', 'Times New Roman'],
        hardwareConcurrency: 8,
        ipAddress: '192.168.1.1',
        platform: 'Win32',
        screenHeight: 1080,
        screenWidth: 1920,
        timezone: 'Europe/Berlin',
        userAgent: 'Mozilla/5.0 Test',
        webglRenderer: 'ANGLE (NVIDIA GeForce)',
        webglVendor: 'Google Inc. (NVIDIA)',
        ...overrides
    };
}

function createStoredRecord(overrides: Partial<DeviceFingerprint> = {}): DeviceFingerprint {
    return {
        acceptLanguage: 'en-US',
        audioHash: 'audio-hash-abc',
        canvasHash: 'canvas-hash-xyz',
        colorDepth: 24,
        deviceMemory: 8,
        driftCount: 0,
        firstSeenAt: new Date(),
        fontsList: JSON.stringify(['Arial', 'Helvetica', 'Times New Roman']),
        fullHash: 'full-hash-123',
        hardwareConcurrency: 8,
        id: 'record-id-1',
        ipAddress: '192.168.1.1',
        lastScore: 100,
        lastSeenAt: new Date(),
        platform: 'Win32',
        screenHeight: 1080,
        screenWidth: 1920,
        stableHash: 'stable-hash-456',
        timezone: 'Europe/Berlin',
        userAgent: 'Mozilla/5.0 Test',
        userId: null,
        visitorId: 'visitor-id-existing',
        webglRenderer: 'ANGLE (NVIDIA GeForce)',
        webglVendor: 'Google Inc. (NVIDIA)',
        ...overrides
    };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('generateStableHash', () => {
    it('produces the same hash for identical inputs (determinism)', () => {
        const signals = createSignals();
        const hash1 = generateStableHash(signals);
        const hash2 = generateStableHash(signals);

        expect(hash1).toBe(hash2);
        expect(hash1).toHaveLength(64); // SHA-256 hex
    });

    it('produces different hashes for different inputs', () => {
        const hash1 = generateStableHash(createSignals({ hardwareConcurrency: 8 }));
        const hash2 = generateStableHash(createSignals({ hardwareConcurrency: 16 }));

        expect(hash1).not.toBe(hash2);
    });

    it('handles null fields gracefully', () => {
        const hash = generateStableHash(createSignals({ deviceMemory: null, platform: null }));

        expect(hash).toHaveLength(64);
    });
});

describe('generateFullHash', () => {
    it('includes biometric signals in the hash', () => {
        const hashA = generateFullHash(createSignals({ canvasHash: 'aaa' }));
        const hashB = generateFullHash(createSignals({ canvasHash: 'bbb' }));

        expect(hashA).not.toBe(hashB);
    });
});

describe('calculateJaccardSimilarity', () => {
    it('returns 1.0 for identical lists', () => {
        expect(calculateJaccardSimilarity(['a', 'b', 'c'], ['a', 'b', 'c'])).toBe(1);
    });

    it('returns 0.0 for completely disjoint lists', () => {
        expect(calculateJaccardSimilarity(['a', 'b'], ['c', 'd'])).toBe(0);
    });

    it('returns correct fraction for partial overlap', () => {
        // intersection = {a, b}, union = {a, b, c, d} → 2/4 = 0.5
        expect(calculateJaccardSimilarity(['a', 'b'], ['a', 'b', 'c', 'd'])).toBe(0.5);
    });

    it('returns 1.0 for two empty lists', () => {
        expect(calculateJaccardSimilarity([], [])).toBe(1);
    });
});

describe('calculateSimilarity', () => {
    it('returns score 100 for an exact match', () => {
        const signals = createSignals();
        const stored = createStoredRecord();
        const result = calculateSimilarity(signals, stored);

        expect(result.score).toBe(100);
        expect(result.driftedFields).toHaveLength(0);
        expect(result.matchedFields.length).toBeGreaterThan(0);
    });

    it('returns score > 75 for a single field drift', () => {
        const signals = createSignals({ timezone: 'America/New_York' });
        const stored = createStoredRecord();
        const result = calculateSimilarity(signals, stored);

        expect(result.score).toBeGreaterThan(75);
        expect(result.driftedFields).toContain('timezone');
    });

    it('returns lower score for multiple drifted fields', () => {
        const signals = createSignals({
            audioHash: 'different-audio',
            canvasHash: 'different-canvas',
            webglRenderer: 'Different GPU'
        });
        const stored = createStoredRecord();
        const result = calculateSimilarity(signals, stored);

        expect(result.score).toBeLessThan(75);
        expect(result.driftedFields).toContain('canvasHash');
        expect(result.driftedFields).toContain('audioHash');
        expect(result.driftedFields).toContain('webglRenderer');
    });

    it('skips null signals without penalizing', () => {
        const signals = createSignals({
            audioHash: null,
            canvasHash: null,
            fontsList: null,
            webglRenderer: null,
            webglVendor: null
        });
        const stored = createStoredRecord();
        const result = calculateSimilarity(signals, stored);

        // Remaining signals (screen, hardware, memory, timezone, platform) should all match
        expect(result.score).toBe(100);
        expect(result.driftedFields).toHaveLength(0);
    });

    it('returns 0 when all signals are null on incoming', () => {
        const signals = createSignals({
            audioHash: null,
            canvasHash: null,
            colorDepth: null,
            deviceMemory: null,
            fontsList: null,
            hardwareConcurrency: null,
            platform: null,
            screenHeight: null,
            screenWidth: null,
            timezone: null,
            webglRenderer: null,
            webglVendor: null
        });
        const stored = createStoredRecord();
        const result = calculateSimilarity(signals, stored);

        expect(result.score).toBe(0);
    });
});

describe('identifyOrCreateVisitor', () => {
    // beforeEach(() => {
    //     vi.clearAllMocks();
    // });

    it('returns existing visitorId on exact fullHash match', async () => {
        const signals = createSignals();
        const existing = createStoredRecord();

        mockPrisma.deviceFingerprint.findFirst.mockResolvedValue(existing);
        mockPrisma.deviceFingerprint.update.mockResolvedValue(existing);

        const result = await identifyOrCreateVisitor(signals);

        expect(result.visitorId).toBe('visitor-id-existing');
        expect(result.isNew).toBe(false);
        expect(result.score).toBe(100);
        expect(mockPrisma.deviceFingerprint.update).toHaveBeenCalled();
    });

    it('creates new visitorId when no match is found', async () => {
        const signals = createSignals();

        mockPrisma.deviceFingerprint.findFirst.mockResolvedValue(null);
        mockPrisma.deviceFingerprint.findMany.mockResolvedValue([]);
        mockPrisma.deviceFingerprint.create.mockResolvedValue({});

        const result = await identifyOrCreateVisitor(signals);

        expect(result.isNew).toBe(true);
        expect(result.visitorId).toBeDefined();
        expect(result.visitorId).toHaveLength(36); // UUID
        expect(mockPrisma.deviceFingerprint.create).toHaveBeenCalled();
    });

    it('merges when fuzzy match is above threshold with ≤3 drift', async () => {
        const signals = createSignals({ timezone: 'America/New_York' });
        const existing = createStoredRecord();

        mockPrisma.deviceFingerprint.findFirst.mockResolvedValue(null);
        mockPrisma.deviceFingerprint.findMany.mockResolvedValue([existing]);
        mockPrisma.deviceFingerprint.update.mockResolvedValue(existing);

        const result = await identifyOrCreateVisitor(signals);

        expect(result.visitorId).toBe('visitor-id-existing');
        expect(result.isNew).toBe(false);
        expect(result.driftedFields).toContain('timezone');
        expect(mockPrisma.deviceFingerprint.update).toHaveBeenCalled();
    });

    it('creates new visitor when drift budget is exceeded (>3 fields)', async () => {
        const signals = createSignals({
            audioHash: 'new-audio',
            canvasHash: 'new-canvas',
            timezone: 'Asia/Tokyo',
            webglRenderer: 'New GPU',
            webglVendor: 'New Vendor'
        });
        // Create a stored record that will match on some signals but drift on 5
        const existing = createStoredRecord();

        mockPrisma.deviceFingerprint.findFirst.mockResolvedValue(null);
        mockPrisma.deviceFingerprint.findMany.mockResolvedValue([existing]);
        mockPrisma.deviceFingerprint.create.mockResolvedValue({});

        const result = await identifyOrCreateVisitor(signals);

        expect(result.isNew).toBe(true);
        expect(result.visitorId).not.toBe('visitor-id-existing');
        expect(mockPrisma.deviceFingerprint.create).toHaveBeenCalled();
    });
});
