import 'server-only';

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

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
        pathname.startsWith(routes.tryQuiz) ||
        pathname.startsWith('/_next') ||
        pathname.startsWith('/favicon');
    const token =
        request.cookies.get('better-auth.session-token')?.value ??
        request.cookies.get('__Secure-better-auth.session-token')?.value;
    if (authPath && token) return NextResponse.redirect(new URL('/api/auth/redirect', request.url));
    if ((!publicPath || pathname.startsWith('/organization/')) && !token) {
        const login = new URL(routes.signIn, request.url);
        login.searchParams.set('callbackUrl', pathname);
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
