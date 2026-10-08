'use client';

import { useSyncExternalStore } from 'react';

import { isPasskeySupported } from './auth-client';

const subscribe = (): (() => void) => () => {};

/**
 * Returns whether the current browser supports WebAuthn / passkeys.
 *
 * Uses {@link useSyncExternalStore} so the value is `false` during SSR and the
 * real feature-detection result on the client, avoiding hydration mismatches
 * and synchronous `setState` inside effects.
 */
export function usePasskeySupported(): boolean {
    return useSyncExternalStore(
        subscribe,
        () => isPasskeySupported(),
        () => false
    );
}
