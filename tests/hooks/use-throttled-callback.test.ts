import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useThrottledCallback } from '@/hooks/use-throttled-callback';

describe('useThrottledCallback', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('throttles calls to the specified wait interval', () => {
        const callback = vi.fn();
        const { result } = renderHook(() => useThrottledCallback(callback, 250));

        result.current();
        result.current();
        result.current();

        // Default: leading=false, trailing=true, so nothing fires immediately
        vi.advanceTimersByTime(250);

        // The trailing call should fire
        expect(callback).toHaveBeenCalledTimes(1);
    });

    it('fires immediately with leading: true', () => {
        const callback = vi.fn();
        const { result } = renderHook(() => useThrottledCallback(callback, 250, [], { leading: true, trailing: true }));

        result.current();

        expect(callback).toHaveBeenCalledOnce();
    });

    it('cancel() prevents pending invocation', () => {
        const callback = vi.fn();
        const { result } = renderHook(() => useThrottledCallback(callback, 250));

        result.current();
        result.current.cancel();

        vi.advanceTimersByTime(500);

        expect(callback).not.toHaveBeenCalled();
    });

    it('flush() immediately invokes the pending callback', () => {
        const callback = vi.fn();
        const { result } = renderHook(() => useThrottledCallback(callback, 250));

        result.current();
        result.current.flush();

        expect(callback).toHaveBeenCalledOnce();
    });

    it('cancels on unmount to prevent memory leaks', () => {
        const callback = vi.fn();
        const { unmount } = renderHook(() => useThrottledCallback(callback, 250));

        unmount();

        vi.advanceTimersByTime(500);

        // The callback should not fire after unmount
        expect(callback).not.toHaveBeenCalled();
    });
});
