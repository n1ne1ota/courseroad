import { randomUUID } from 'crypto';

/**
 * Extract or generate a request ID for request correlation
 * Checks for x-request-id header first, then generates a new UUID
 */
export function getRequestId(headers: Headers): string {
    const existingId = headers.get('x-request-id');
    if (existingId) {
        return existingId;
    }
    return randomUUID();
}

/**
 * Extract or generate a request ID from NextRequest
 */
export function getRequestIdFromRequest(req: Request): string {
    return getRequestId(req.headers);
}
