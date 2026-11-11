import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useDebouncedCallback } from '@/hooks/use-debounced-callback';

describe('useDebouncedCallback', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('does not call the callback immediately', () => {
        const callback = vi.fn();
        const { result } = renderHook(() => useDebouncedCallback(callback, 300));

        act(() => {
            result.current('arg1');
        });

        expect(callback).not.toHaveBeenCalled();
    });

    it('calls the callback after the delay with correct arguments', () => {
        const callback = vi.fn();
        const { result } = renderHook(() => useDebouncedCallback(callback, 300));

        act(() => {
            result.current('hello', 42);
        });

        act(() => vi.advanceTimersByTime(300));

        expect(callback).toHaveBeenCalledOnce();
        expect(callback).toHaveBeenCalledWith('hello', 42);
    });

    it('only triggers once after rapid calls with the last arguments', () => {
        const callback = vi.fn();
        const { result } = renderHook(() => useDebouncedCallback(callback, 200));

        act(() => {
            result.current('first');
            result.current('second');
            result.current('third');
        });

        act(() => vi.advanceTimersByTime(200));

        expect(callback).toHaveBeenCalledOnce();
        expect(callback).toHaveBeenCalledWith('third');
    });

    it('reflects updated callback references without resetting the timer', () => {
        let callCount = 0;
        const callbackA = vi.fn(() => {
            callCount = 1;
        });
        const callbackB = vi.fn(() => {
            callCount = 2;
        });

        const { rerender, result } = renderHook(({ cb }) => useDebouncedCallback(cb, 300), {
            initialProps: { cb: callbackA }
        });

        act(() => {
            result.current();
        });

        // Swap the callback mid-timer
        rerender({ cb: callbackB });

        act(() => vi.advanceTimersByTime(300));

        // The latest callback reference should have been invoked
        expect(callCount).toBe(2);
    });
});
