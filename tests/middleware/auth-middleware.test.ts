import type { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock server-only to prevent import errors in test environment
vi.mock('server-only', () => ({}));

import { authMiddleware } from '@/server/proxy/auth-routing';

/**
 * Helper to create a NextRequest with configurable path and cookies.
 */
function createRequest(path: string, options?: { cookies?: Record<string, string> }): NextRequest {
    const url = new URL(path, 'http://localhost:3000');
    const request = new NextRequest(url);

    if (options?.cookies) {
        for (const [name, value] of Object.entries(options.cookies)) {
            request.cookies.set(name, value);
        }
    }

    return request;
}

/**
 * Determine if a response is a redirect.
 */
function isRedirect(response: NextResponse | undefined): boolean {
    if (!response) return false;
    return response.status >= 300 && response.status < 400;
}

/**
 * Extract the redirect destination from a NextResponse.
 */
function getRedirectUrl(response: NextResponse | undefined): string | null {
    if (!response) return null;
    return response.headers.get('location');
}

describe('authMiddleware', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Given public pages without authentication', () => {
        const publicPaths = ['/', '/pricing', '/courses', '/about', '/new-password', '/reset-password'];

        it.each(publicPaths)('allows unauthenticated access to %s', path => {
            const request = createRequest(path);
            const response = authMiddleware(request);

            expect(isRedirect(response)).toBe(false);
        });
    });

    describe('Given auth pages without authentication', () => {
        const authPaths = ['/sign-in', '/sign-up', '/otp'];

        it.each(authPaths)('allows unauthenticated access to %s', path => {
            const request = createRequest(path);
            const response = authMiddleware(request);

            expect(isRedirect(response)).toBe(false);
        });
    });

    describe('Given internal framework paths', () => {
        it('allows access to /_next/static paths', () => {
            const request = createRequest('/_next/static/chunks/main.js');
            const response = authMiddleware(request);

            expect(isRedirect(response)).toBe(false);
        });

        it('allows access to /favicon paths', () => {
            const request = createRequest('/favicon.ico');
            const response = authMiddleware(request);

            expect(isRedirect(response)).toBe(false);
        });
    });

    describe('Given protected routes without authentication', () => {
        const protectedPaths = [
            '/learner/dashboard',
            '/admin/dashboard',
            '/creator/dashboard',
            '/staff/dashboard',
            '/admin/dashboard/users',
            '/creator/dashboard/courses'
        ];

        it.each(protectedPaths)('redirects unauthenticated user from %s to /sign-in', path => {
            const request = createRequest(path);
            const response = authMiddleware(request);

            expect(isRedirect(response)).toBe(true);
            const redirectUrl = getRedirectUrl(response);
            expect(redirectUrl).toContain('/sign-in');
        });

        it('includes callbackUrl in the redirect for protected routes', () => {
            const request = createRequest('/admin/dashboard');
            const response = authMiddleware(request);

            const redirectUrl = getRedirectUrl(response);
            expect(redirectUrl).toContain('callbackUrl=%2Fadmin%2Fdashboard');
        });
    });

    describe('Given auth pages with a valid session token', () => {
        const sessionCookies = { 'better-auth.session-token': 'valid-session-token' };

        it('redirects authenticated user away from /sign-in', () => {
            const request = createRequest('/sign-in', { cookies: sessionCookies });
            const response = authMiddleware(request);

            expect(isRedirect(response)).toBe(true);
            const redirectUrl = getRedirectUrl(response);
            expect(redirectUrl).toContain('/api/auth/redirect');
        });

        it('redirects authenticated user away from /sign-up', () => {
            const request = createRequest('/sign-up', { cookies: sessionCookies });
            const response = authMiddleware(request);

            expect(isRedirect(response)).toBe(true);
            const redirectUrl = getRedirectUrl(response);
            expect(redirectUrl).toContain('/api/auth/redirect');
        });
    });

    describe('Given protected routes with a valid session token', () => {
        const sessionCookies = { 'better-auth.session-token': 'valid-session-token' };

        it('allows authenticated access to /learner/dashboard', () => {
            const request = createRequest('/learner/dashboard', { cookies: sessionCookies });
            const response = authMiddleware(request);

            expect(isRedirect(response)).toBe(false);
        });

        it('allows authenticated access to /admin/dashboard', () => {
            const request = createRequest('/admin/dashboard', { cookies: sessionCookies });
            const response = authMiddleware(request);

            expect(isRedirect(response)).toBe(false);
        });
    });

    describe('Given visitor fingerprint cookies', () => {
        it('attaches x-visitor-id header when cookie is present', () => {
            const request = createRequest('/learner/dashboard', {
                cookies: {
                    'better-auth.session-token': 'valid-token',
                    internal_visitor_id: 'fp-abc-123'
                }
            });
            const response = authMiddleware(request);

            expect(response?.headers.get('x-middleware-request-x-visitor-id')).toBe('fp-abc-123');
        });
    });
});
