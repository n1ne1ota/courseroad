'use client';

import type { ReactNode } from 'react';
import { createContext, startTransition, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { identifyDevice } from '@/features/analytics/actions';

import type { FingerprintContextValue, RawFingerprintSignals } from '@/types/fingerprint.types';

const FingerprintContext = createContext<FingerprintContextValue>({
  isIdentifying: false,
  visitorId: null
});

/**
 * Extract raw fingerprint signals from ThumbmarkJS components and browser APIs.
 * Uses a mix of ThumbmarkJS hash outputs (canvas, audio) and direct browser APIs
 * (navigator, screen, Intl) for hardware signals.
 */
function extractSignals(components: Record<string, unknown>): RawFingerprintSignals {
  // ThumbmarkJS nests video card info under components.videocard
  const videocard = components.videocard as Record<string, unknown> | undefined;

  return {
    audioHash: typeof components.audio === 'string' ? components.audio : null,
    canvasHash: typeof components.canvas === 'string' ? components.canvas : null,
    colorDepth: typeof screen?.colorDepth === 'number' ? screen.colorDepth : null,
    deviceMemory:
      typeof (navigator as NavigatorWithMemory).deviceMemory === 'number'
        ? (navigator as NavigatorWithMemory).deviceMemory
        : null,
    fontsList: Array.isArray(components.fonts) ? (components.fonts as string[]) : null,
    hardwareConcurrency: typeof navigator?.hardwareConcurrency === 'number' ? navigator.hardwareConcurrency : null,
    platform: navigator?.platform ?? null,
    screenHeight: typeof screen?.height === 'number' ? screen.height : null,
    screenWidth: typeof screen?.width === 'number' ? screen.width : null,
    timezone: Intl?.DateTimeFormat().resolvedOptions().timeZone ?? null,
    webglRenderer: typeof videocard?.renderer === 'string' ? videocard.renderer : null,
    webglVendor: typeof videocard?.vendor === 'string' ? videocard.vendor : null
  };
}

interface FingerprintProviderProps {
  children: ReactNode;
}

/**
 * Silently identifies the current device via ThumbmarkJS and the identifyDevice server action.
 * Runs once per session, post-hydration, wrapped in startTransition to avoid blocking UI.
 */
export function FingerprintProvider({ children }: FingerprintProviderProps) {
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [isIdentifying, setIsIdentifying] = useState(false);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    startTransition(() => {
      setIsIdentifying(true);
    });

    (async () => {
      try {
        // Dynamic import to ensure ThumbmarkJS only loads client-side
        const { Thumbmark } = await import('@thumbmarkjs/thumbmarkjs');
        const tm = new Thumbmark({ logging: false });
        const result = await tm.get();

        const signals = extractSignals(result.components as unknown as Record<string, unknown>);
        const response = await identifyDevice(signals);

        startTransition(() => {
          setVisitorId(response.data?.visitorId ?? null);
          setIsIdentifying(false);
        });
      } catch {
        startTransition(() => {
          setIsIdentifying(false);
        });
      }
    })();
  }, []);

  const contextValue = useMemo(() => ({ isIdentifying, visitorId }), [isIdentifying, visitorId]);

  return <FingerprintContext value={contextValue}>{children}</FingerprintContext>;
}

/**
 * Access the fingerprint context.
 * Returns `{ visitorId, isIdentifying }`.
 */
export function useFingerprint(): FingerprintContextValue {
  return useContext(FingerprintContext);
}

/** Navigator extension for deviceMemory (not in all browsers) */
interface NavigatorWithMemory extends Navigator {
  deviceMemory: number;
}
