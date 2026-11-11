import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useInView } from '@/hooks/use-in-view';

type IntersectionObserverCallback = ConstructorParameters<typeof IntersectionObserver>[0];

class MockIntersectionObserver {
    static instances: MockIntersectionObserver[] = [];

    callback: IntersectionObserverCallback;
    disconnect = vi.fn();
    observe = vi.fn();
    unobserve = vi.fn();

    constructor(callback: IntersectionObserverCallback) {
        this.callback = callback;
        MockIntersectionObserver.instances.push(this);
    }
}

describe('useInView', () => {
    beforeEach(() => {
        MockIntersectionObserver.instances = [];
        vi.stubGlobal('IntersectionObserver', MockIntersectionObserver as unknown as typeof IntersectionObserver);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('observes the assigned element', () => {
        const { result } = renderHook(() => useInView<HTMLDivElement>());
        const element = document.createElement('div');

        act(() => {
            result.current.ref(element);
        });

        expect(MockIntersectionObserver.instances).toHaveLength(1);
        expect(MockIntersectionObserver.instances[0]?.observe).toHaveBeenCalledWith(element);
    });

    it('reconnects to a new element when the ref target changes', () => {
        const { result } = renderHook(() => useInView<HTMLDivElement>());
        const firstElement = document.createElement('div');
        const secondElement = document.createElement('div');

        act(() => {
            result.current.ref(firstElement);
        });

        const firstObserver = MockIntersectionObserver.instances[0];

        act(() => {
            result.current.ref(secondElement);
        });

        expect(firstObserver?.disconnect).toHaveBeenCalled();
        expect(MockIntersectionObserver.instances).toHaveLength(2);
        expect(MockIntersectionObserver.instances[1]?.observe).toHaveBeenCalledWith(secondElement);
    });

    it('marks the element visible and disconnects after the first intersection when once is enabled', () => {
        const { result } = renderHook(() => useInView<HTMLDivElement>({ once: true }));
        const element = document.createElement('div');

        act(() => {
            result.current.ref(element);
        });

        const observer = MockIntersectionObserver.instances[0];

        act(() => {
            observer?.callback([{ isIntersecting: true } as IntersectionObserverEntry], observer as never);
        });

        expect(result.current.inView).toBe(true);
        expect(observer?.disconnect).toHaveBeenCalled();
    });
});
