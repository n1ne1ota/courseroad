'use client';

import { useCallback, useState } from 'react';

export interface UseShareOptions {
    text?: string;
    title: string;
    url: string;
}

export type ShareStatus = 'idle' | 'shared' | 'copied' | 'error';

export function useShare() {
    const [status, setStatus] = useState<ShareStatus>('idle');

    const share = useCallback(async (data: UseShareOptions): Promise<ShareStatus> => {
        try {
            if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare?.(data)) {
                await navigator.share(data);
                setStatus('shared');
                return 'shared';
            } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
                await navigator.clipboard.writeText(data.url);
                setStatus('copied');
                return 'copied';
            } else {
                setStatus('error');
                return 'error';
            }
        } catch (err) {
            if (err instanceof DOMException && err.name === 'AbortError') {
                setStatus('idle');
                return 'idle';
            }
            setStatus('error');
            return 'error';
        }
    }, []);

    return { share, status };
}
