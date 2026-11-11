'use client';

import type { ReactNode } from 'react';

import { KurumeError } from '@courseroad/kurume-ui';
import { ErrorBoundary } from 'react-error-boundary';

interface ErrorStateProps {
  error: Error & { digest?: string };
  reset: () => void;
  scope: 'global' | 'route';
}

/**
 * Standard Next.js Route Error Fallback
 */
export function ErrorState({ error, reset, scope }: ErrorStateProps) {
  return <KurumeError error={error} reset={reset} scope={scope} />;
}

/**
 * Custom Error Boundary for wrapping specific components or sections
 */
interface ComponentErrorBoundaryProps {
  children: ReactNode;
}

export function ComponentErrorBoundary({ children }: ComponentErrorBoundaryProps) {
  return (
    <ErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => (
        <KurumeError
          error={error as Error & { digest?: string }}
          resetErrorBoundary={resetErrorBoundary}
          scope='component'
        />
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
