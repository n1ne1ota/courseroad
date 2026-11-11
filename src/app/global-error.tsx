'use client';

import { useEffect } from 'react';

import { log } from '@/lib/logging/client';

import { ErrorState } from '@/components/layout/error-state';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    log.error('Global Error Boundary caught error', error, { digest: error.digest });
  }, [error]);

  return (
    <html lang='en'>
      <body>
        <ErrorState error={error} reset={reset} scope='global' />
      </body>
    </html>
  );
}
