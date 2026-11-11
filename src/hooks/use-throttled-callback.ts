import type { DependencyList } from 'react';
import { useMemo, useRef } from 'react';

import throttle from 'lodash.throttle';

import { useUnmount } from './use-unmount';

interface ThrottleSettings {
    leading?: boolean | undefined;
    trailing?: boolean | undefined;
}

const defaultOptions: ThrottleSettings = {
    leading: false,
    trailing: true
};

/**
 * A hook that returns a throttled callback function.
 *
 * @param fn The function to throttle
 * @param wait The time in ms to wait before calling the function
 * @param dependencies The dependencies to watch for changes (kept for signature compatibility)
 * @param options The throttle options
 */
export function useThrottledCallback<T extends (...args: unknown[]) => unknown>(
    fn: T,
    wait = 250,
    dependencies: DependencyList = [],
    options: ThrottleSettings = defaultOptions
): T & {
    cancel: () => void;
    flush: () => void;
} {
    const fnRef = useRef<T>(fn);

    // Keep fnRef updated with the latest function during render
    fnRef.current = fn;

    // Keep options in a ref to avoid recreation loops from object literals
    const optionsRef = useRef<ThrottleSettings>(options);
    optionsRef.current = options;

    const handler = useMemo(() => {
        const throttled = throttle(
            function (this: unknown, ...args: unknown[]) {
                return fnRef.current.apply(this, args as Parameters<T>);
            } as unknown as T,
            wait,
            optionsRef.current
        );

        return throttled as unknown as T & {
            cancel: () => void;
            flush: () => void;
        };
    }, [wait]);

    useUnmount(() => {
        handler.cancel();
    });

    void dependencies;

    return handler;
}

export default useThrottledCallback;
