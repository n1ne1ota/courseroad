import 'server-only';

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { getCallbackUrl, isValidInternalUrl } from '@/lib/auth/callback-url';
import { authPagePaths, publicPagePaths, routes } from '@/lib/routes';
import { extractOrgSlug } from '@/lib/routes/org';

/** Optimistic navigation only. Cookies and forwarded slugs never grant access. */
export function authMiddleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    const authPath =
        (authPagePaths as readonly string[]).includes(pathname) ||
        pathname.startsWith('/auth') ||
        pathname.startsWith(routes.auth);
    const publicPath =
        (publicPagePaths as readonly string[]).includes(pathname) ||
        authPath ||
        pathname.startsWith('/accept-invitation/') ||
        // The unsubscribe link in an announcement email works signed out; its signed token is the credential.
        pathname.startsWith('/unsubscribe/') ||
        // Blog posts and both RSS feeds are public: /blog/<slug>, /blog/rss.xml and /changelog/rss.xml.
        pathname.startsWith(`${routes.blog}/`) ||
        pathname.startsWith(`${routes.changelog}/`) ||
        pathname.startsWith(routes.tryQuiz) ||
        pathname.startsWith('/_next') ||
        pathname.startsWith('/favicon');
    const token =
        request.cookies.get('better-auth.session-token')?.value ??
        request.cookies.get('__Secure-better-auth.session-token')?.value;
    // OTP and second-factor pages must remain reachable while authentication
    // or verification is incomplete; a cookie alone cannot prove completion.
    if (authPath && token && pathname !== routes.otp && pathname !== routes.twoFactor) {
        const destination = new URL('/api/auth/redirect', request.url);
        const callback = getCallbackUrl(request.nextUrl.searchParams, '');
        if (callback) destination.searchParams.set('callbackUrl', callback);
        return NextResponse.redirect(destination);
    }
    if ((!publicPath || pathname.startsWith('/organization/')) && !token) {
        const login = new URL(routes.signIn, request.url);
        const callback = `${pathname}${request.nextUrl.search}`;
        if (isValidInternalUrl(callback)) login.searchParams.set('callbackUrl', callback);
        return NextResponse.redirect(login);
    }
    const requestHeaders = new Headers(request.headers);
    requestHeaders.delete('x-organization-slug');
    requestHeaders.delete('x-visitor-id');
    const slug = extractOrgSlug(pathname);
    if (slug) requestHeaders.set('x-organization-slug', slug);
    const visitor = request.cookies.get('internal_visitor_id')?.value;
    if (visitor) requestHeaders.set('x-visitor-id', visitor);
    const requestId = requestHeaders.get('x-request-id') || crypto.randomUUID();
    requestHeaders.set('x-request-id', requestId);
    const response = NextResponse.next({ request: { headers: requestHeaders } });
    response.headers.set('x-request-id', requestId);
    return response;
}
