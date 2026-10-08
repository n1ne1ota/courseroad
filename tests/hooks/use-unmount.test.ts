import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useUnmount } from '@/hooks/use-unmount';

describe('useUnmount', () => {
    it('should call the callback when the component unmounts', () => {
        const callback = vi.fn();
        const { unmount } = renderHook(() => useUnmount(callback));

        expect(callback).not.toHaveBeenCalled();

        unmount();

        expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should not call the callback on mount or update', () => {
        const callback = vi.fn();
        const { rerender, unmount } = renderHook(() => useUnmount(callback));

        expect(callback).not.toHaveBeenCalled();

        rerender();
        expect(callback).not.toHaveBeenCalled();

        unmount();
        expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should call the latest callback when unmounting', () => {
        const callback1 = vi.fn();
        const callback2 = vi.fn();

        const { rerender, unmount } = renderHook(({ cb }) => useUnmount(cb), {
            initialProps: { cb: callback1 }
        });

        // Update the callback
        rerender({ cb: callback2 });

        unmount();

        expect(callback1).not.toHaveBeenCalled();
        expect(callback2).toHaveBeenCalledTimes(1);
    });

    it('should handle async callbacks', async () => {
        const callback = vi.fn().mockImplementation(() => Promise.resolve());
        const { unmount } = renderHook(() => useUnmount(callback));

        unmount();

        expect(callback).toHaveBeenCalledTimes(1);
    });
});
