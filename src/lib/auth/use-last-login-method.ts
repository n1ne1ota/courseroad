'use client';

import { useSyncExternalStore } from 'react';

import { authClient } from './auth-client';

const subscribe = (): (() => void) => () => {};

/**
 * Returns the login method the user most recently used (e.g. `google`,
 * `github`, `email`, `magic-link`, `passkey`), or `null` if none is recorded.
 *
 * Backed by the Better Auth `lastLoginMethod` client plugin, which reads a
 * non-HttpOnly cookie. Uses {@link useSyncExternalStore} so the value is `null`
 * during SSR and resolves on the client, avoiding hydration mismatches.
 */
export function useLastLoginMethod(): string | null {
    return useSyncExternalStore(
        subscribe,
        () => authClient.getLastUsedLoginMethod(),
        () => null
    );
}
