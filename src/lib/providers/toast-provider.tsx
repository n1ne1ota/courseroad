'use client';

import type { JSX } from 'react';

import { Toaster } from '@courseroad/kurume-ui';

/** Mounts the Kurume toast stack once for the app; call `show*Toast` helpers from anywhere. */
export function ToastProvider(): JSX.Element {
  return <Toaster position='bottom-right' />;
}
