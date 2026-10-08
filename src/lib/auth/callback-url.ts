'use client';

import { authPagePaths, type AuthRoute } from '@/lib/routes';

/**
 * Callback URL Utilities
 *
 * Handles redirect URLs after authentication with security validation
 * to prevent open redirect vulnerabilities.
 */

/**
 * Validates if a URL is safe for internal redirect
 * Only allows paths that start with '/' and don't start with '//'
 */
export function isValidInternalUrl(url: string): boolean {
    if (!url) return false;

    // Must start with / but not // (prevents protocol-relative URLs)
    if (!url.startsWith('/') || url.startsWith('//')) return false;

    // Prevent URLs with special schemes
    const lowercaseUrl = url.toLowerCase();
    if (lowercaseUrl.includes('javascript:') || lowercaseUrl.includes('data:') || lowercaseUrl.includes('vbscript:')) {
        return false;
    }

    return true;
}

/**
 * Get callback URL from query params with validation
 * Falls back to default path if not present or invalid
 */
export function getCallbackUrl(searchParams?: URLSearchParams | null, defaultPath: string = '/'): string {
    if (!searchParams) {
        // Try to get from window location if available
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const callbackUrl = params.get('callbackUrl');

            if (callbackUrl && isValidInternalUrl(callbackUrl)) return callbackUrl;
        }

        return defaultPath;
    }

    const callbackUrl = searchParams.get('callbackUrl');

    if (callbackUrl && isValidInternalUrl(callbackUrl)) return callbackUrl;

    return defaultPath;
}

/**
 * Build auth URL with callback parameter
 */
export function createAuthUrl(authPath: AuthRoute, callbackUrl?: string): string {
    if (!callbackUrl || !isValidInternalUrl(callbackUrl)) return authPath;

    return `${authPath}?callbackUrl=${encodeURIComponent(callbackUrl)}`;
}

/**
 * Get current path for use as callback URL
 * Excludes auth pages themselves
 */
export function getCurrentPathForCallback(): string | null {
    if (typeof window === 'undefined') return null;

    const path = window.location.pathname;

    // Don't use auth pages as callback URLs
    if (authPagePaths.some(page => path.startsWith(page))) return null;

    return path;
}
