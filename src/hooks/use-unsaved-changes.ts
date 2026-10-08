import { useCallback, useEffect, useState } from 'react';

import type { Route } from 'next';
import { useRouter } from 'next/navigation';

export function useUnsavedChanges(isDirty: boolean) {
    const router = useRouter();
    const [showPrompt, setShowPrompt] = useState(false);
    const [pendingUrl, setPendingUrl] = useState<string | null>(null);

    // Handle browser native beforeunload (refresh, close tab)
    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (isDirty) {
                event.preventDefault();
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                event.returnValue = '';
            }
        };

        if (isDirty) window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [isDirty]);

    // Intercept internal link clicks
    useEffect(() => {
        if (!isDirty) return;

        const handleClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            const anchor = target.closest('a');

            if (anchor) {
                const href = anchor.getAttribute('href');
                const targetAttr = anchor.getAttribute('target');

                // Ignore if opening in new tab or external link
                if (
                    !href ||
                    href.startsWith('http') ||
                    href.startsWith('mailto') ||
                    targetAttr === '_blank' ||
                    event.metaKey ||
                    event.ctrlKey ||
                    event.button !== 0 // Only left click
                ) {
                    return;
                }

                event.preventDefault();
                event.stopPropagation();
                setPendingUrl(href);
                setShowPrompt(true);
            }
        };

        // Use capture phase to ensure we catch it before other handlers
        window.addEventListener('click', handleClick, true);

        return () => {
            window.removeEventListener('click', handleClick, true);
        };
    }, [isDirty]);

    const confirmNavigation = useCallback(() => {
        if (pendingUrl) {
            setShowPrompt(false);
            // Small delay to allow dialog to close cleanly before navigating
            setTimeout(() => {
                router.push(pendingUrl as Route);
            }, 0);
        }
    }, [pendingUrl, router]);

    const cancelNavigation = useCallback(() => {
        setShowPrompt(false);
        setPendingUrl(null);
    }, []);

    return {
        cancelNavigation,
        confirmNavigation,
        setShowPrompt,
        showPrompt
    };
}
