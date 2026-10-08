import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiKeyUtility } from '@/lib/utils/api-key';

describe('ApiKeyUtility', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('throws when constructed with an empty key array', () => {
        expect(() => new ApiKeyUtility([])).toThrow('No API keys provided');
    });

    it('normalizes string keys to ApiKey objects', () => {
        const service = new ApiKeyUtility(['key-a']);
        const key = service.next();

        expect(key).toEqual({ value: 'key-a' });
    });

    it('preserves ApiKey objects with labels', () => {
        const service = new ApiKeyUtility([{ label: 'primary', value: 'key-a' }]);
        const key = service.next();

        expect(key).toEqual({ label: 'primary', value: 'key-a' });
    });

    it('round-robins through available keys', () => {
        const service = new ApiKeyUtility(['key-a', 'key-b', 'key-c']);

        expect(service.next().value).toBe('key-a');
        expect(service.next().value).toBe('key-b');
        expect(service.next().value).toBe('key-c');
        expect(service.next().value).toBe('key-a');
    });

    describe('failure and cooldown', () => {
        it('puts a key on cooldown after maxFailures threshold', () => {
            const service = new ApiKeyUtility(['key-a', 'key-b'], {
                cooldownMs: 10_000,
                maxFailuresBeforeCooldown: 2
            });

            service.next(); // key-a
            service.reportFailure('key-a');
            service.reportFailure('key-a');

            // key-a is now on cooldown, next() should skip it
            const key = service.next();

            expect(key.value).toBe('key-b');
        });

        it('skips keys that are on cooldown', () => {
            const service = new ApiKeyUtility(['key-a', 'key-b'], {
                cooldownMs: 60_000,
                maxFailuresBeforeCooldown: 1
            });

            service.next(); // advances past key-a
            service.reportFailure('key-a');

            // Should skip key-a and return key-b repeatedly
            expect(service.next().value).toBe('key-b');
            expect(service.next().value).toBe('key-b');
        });

        it('returns the key with the soonest availability when all are on cooldown', () => {
            const service = new ApiKeyUtility(['key-a', 'key-b'], {
                cooldownMs: 10_000,
                maxFailuresBeforeCooldown: 1
            });

            // Put key-a on cooldown first
            service.reportFailure('key-a');

            // Advance 5 seconds, then put key-b on cooldown
            vi.advanceTimersByTime(5_000);
            service.reportFailure('key-b');

            // key-a expires sooner (in ~5s) vs key-b (in ~10s)
            const key = service.next();

            expect(key.value).toBe('key-a');
        });

        it('respects custom cooldownMs', () => {
            const service = new ApiKeyUtility(['key-a', 'key-b'], {
                cooldownMs: 5_000,
                maxFailuresBeforeCooldown: 1
            });

            service.reportFailure('key-a');

            // key-a is on cooldown
            expect(service.next().value).toBe('key-b');

            // Advance past the cooldown
            vi.advanceTimersByTime(5_001);

            // key-a should be available again
            expect(service.next().value).toBe('key-a');
        });
    });

    describe('reportSuccess', () => {
        it('clears failure count and cooldown for a key', () => {
            const service = new ApiKeyUtility(['key-a', 'key-b'], {
                cooldownMs: 60_000,
                maxFailuresBeforeCooldown: 2
            });

            service.reportFailure('key-a');
            service.reportSuccess('key-a');

            // Failure count was reset, so one more failure should NOT trigger cooldown
            service.reportFailure('key-a');
            const key = service.next();

            expect(key.value).toBe('key-a');
        });

        it('removes an active cooldown', () => {
            const service = new ApiKeyUtility(['key-a', 'key-b'], {
                cooldownMs: 60_000,
                maxFailuresBeforeCooldown: 1
            });

            service.reportFailure('key-a');
            // key-a is on cooldown
            expect(service.next().value).toBe('key-b');

            service.reportSuccess('key-a');
            // key-a should be available again immediately
            expect(service.next().value).toBe('key-a');
        });
    });
});
