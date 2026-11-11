import { describe, expect, it } from 'vitest';

import { getRequestId, getRequestIdFromRequest } from '@/lib/utils/request-id';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

describe('Request ID', () => {
    describe('getRequestId', () => {
        it('returns the existing x-request-id header value', () => {
            const headers = new Headers({ 'x-request-id': 'abc-123' });

            expect(getRequestId(headers)).toBe('abc-123');
        });

        it('generates a valid UUID when no header exists', () => {
            const headers = new Headers();
            const id = getRequestId(headers);

            expect(id).toMatch(UUID_REGEX);
        });

        it('generates different UUIDs on subsequent calls', () => {
            const headers = new Headers();
            const id1 = getRequestId(headers);
            const id2 = getRequestId(headers);

            expect(id1).not.toBe(id2);
        });
    });

    describe('getRequestIdFromRequest', () => {
        it('extracts the request ID from the request headers', () => {
            const req = new Request('https://example.com', {
                headers: { 'x-request-id': 'req-456' }
            });

            expect(getRequestIdFromRequest(req)).toBe('req-456');
        });

        it('generates a UUID when the request has no x-request-id', () => {
            const req = new Request('https://example.com');

            expect(getRequestIdFromRequest(req)).toMatch(UUID_REGEX);
        });
    });
});
