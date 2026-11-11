import { NextRequest } from 'next/server';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { withAuth, withErrorHandling } from '@/server/http/route-handler';
import { getLogContext, log, runWithLogContext } from '@/server/logging/server';

const { getSession } = vi.hoisted(() => ({ getSession: vi.fn() }));

vi.mock('server-only', () => ({}));
vi.mock('@/server/auth/auth', () => ({ auth: { api: { getSession } } }));

describe('API error handling', () => {
    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllEnvs();
        getSession.mockReset();
    });

    it('preserves successful responses and scopes request context to the handler', async () => {
        const response = Response.json({ ok: true });
        let requestContext: ReturnType<typeof getLogContext>;
        const handler = withErrorHandling(async () => {
            await Promise.resolve();
            requestContext = getLogContext();
            return response;
        });

        await runWithLogContext({ organizationId: 'org-123' }, async () => {
            expect(await handler(new NextRequest('https://example.com/api/test'))).toBe(response);
            expect(requestContext).toMatchObject({ organizationId: 'org-123', requestId: expect.any(String) });
            expect(getLogContext()).toEqual({ organizationId: 'org-123' });
        });
        expect(getLogContext()).toBeUndefined();
    });

    it('logs failed requests with context and hides internal error details in production', async () => {
        vi.stubEnv('NODE_ENV', 'production');
        const error = new Error('Private database details');
        const errorLog = vi.spyOn(log, 'error').mockImplementation(() => {});
        const handler = withErrorHandling(() => {
            throw error;
        });

        const response = await handler(new NextRequest('https://example.com/api/test', { method: 'POST' }));

        expect(response.status).toBe(500);
        expect(await response.json()).toEqual({ error: 'Internal server error' });
        expect(errorLog).toHaveBeenCalledWith('API route error', error, {
            duration: expect.any(Number),
            method: 'POST',
            requestId: expect.any(String),
            url: 'https://example.com/api/test'
        });
    });

    it('rejects unauthenticated requests without calling the protected handler', async () => {
        getSession.mockResolvedValue(null);
        vi.spyOn(log, 'warn').mockImplementation(() => {});
        const protectedHandler = vi.fn();

        const response = await withAuth(protectedHandler)(new NextRequest('https://example.com/api/test'));

        expect(response.status).toBe(401);
        expect(protectedHandler).not.toHaveBeenCalled();
    });
});
