'use client';

import { useEffect } from 'react';

import { log } from '@/lib/logging/client';

import { ErrorState } from '@/components/layout/error-state';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    // Log error with Consola (isomorphic and safe in browser)
    log.error('React Error Boundary caught error', error, {
      component: 'ErrorBoundary',
      digest: (error as Error & { digest?: string }).digest
    });
  }, [error]);

  return <ErrorState error={error} reset={reset} scope='route' />;
}
