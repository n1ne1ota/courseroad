import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useDebounce } from '@/hooks/use-debounce';

describe('useDebounce', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('returns the initial value immediately', () => {
        const { result } = renderHook(() => useDebounce('initial', 500));

        expect(result.current).toBe('initial');
    });

    it('updates the debounced value after the delay', () => {
        const { rerender, result } = renderHook(({ value }) => useDebounce(value, 500), {
            initialProps: { value: 'first' }
        });

        rerender({ value: 'second' });
        expect(result.current).toBe('first');

        act(() => {
            vi.advanceTimersByTime(500);
        });

        expect(result.current).toBe('second');
    });

    it('only emits the last value after rapid changes', () => {
        const { rerender, result } = renderHook(({ value }) => useDebounce(value, 300), {
            initialProps: { value: 'a' }
        });

        rerender({ value: 'b' });
        act(() => vi.advanceTimersByTime(100));

        rerender({ value: 'c' });
        act(() => vi.advanceTimersByTime(100));

        rerender({ value: 'd' });

        // Only 200ms elapsed since 'b', and the timer was reset for 'c' and 'd'
        expect(result.current).toBe('a');

        act(() => vi.advanceTimersByTime(300));

        expect(result.current).toBe('d');
    });

    it('uses the default 500ms delay when none is specified', () => {
        const { rerender, result } = renderHook(({ value }) => useDebounce(value), {
            initialProps: { value: 'start' }
        });

        rerender({ value: 'end' });

        act(() => vi.advanceTimersByTime(499));
        expect(result.current).toBe('start');

        act(() => vi.advanceTimersByTime(1));
        expect(result.current).toBe('end');
    });
});
