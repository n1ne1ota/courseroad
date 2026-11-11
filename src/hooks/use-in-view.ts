'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseInViewOptions {
    /** Whether the observer should trigger only once. Default true. */
    once?: boolean;
    /** Optional root element for the observer viewport. */
    root?: Element | null;
    /** Root margin around the element (e.g., '0px 0px -100px 0px') */
    rootMargin?: string;
    /** Visibility threshold (0 to 1) */
    threshold?: number | number[];
}

/**
 * A highly performant hook utilizing IntersectionObserver to determine
 * when an element enters the viewport. Perfect for triggering lazy-load
 * state or CSS entrance animations alongside smooth scrolling.
 */
export function useInView<T extends Element = HTMLDivElement>({
    once = true,
    root = null,
    rootMargin = '0px',
    threshold = 0.1
}: UseInViewOptions = {}) {
    const observerRef = useRef<IntersectionObserver | null>(null);
    const [node, setNode] = useState<T | null>(null);
    const [inView, setInView] = useState(false);

    const ref = useCallback((element: T | null) => {
        observerRef.current?.disconnect();
        observerRef.current = null;
        if (!element) setInView(false);
        setNode(element);
    }, []);

    useEffect(() => {
        // SSR guard
        if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return;

        if (!node) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                const isIntersecting = entry?.isIntersecting ?? false;
                setInView(isIntersecting);
                if (isIntersecting && once) observer.disconnect();
            },
            { root, rootMargin, threshold }
        );

        observerRef.current = observer;
        observer.observe(node);

        return () => {
            if (observerRef.current === observer) observerRef.current = null;
            observer.disconnect();
        };
    }, [node, once, root, rootMargin, threshold]);

    return { inView, ref };
}
