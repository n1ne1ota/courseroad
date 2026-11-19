'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';

import type { ThemeProviderProps } from 'next-themes';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ReactLenis } from 'lenis/react';
import { ThemeProvider as NextThemeProvider } from 'next-themes';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

import { FingerprintProvider } from '@/lib/providers/fingerprint-provider';
import { ToastProvider } from '@/lib/providers/toast-provider';

export interface ProviderProps {
  children: ReactNode;
  themeProps?: ThemeProviderProps;
}

export function Providers({ children, themeProps }: ProviderProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <FingerprintProvider>
      <QueryClientProvider client={queryClient}>
        <NuqsAdapter>
          <NextThemeProvider {...themeProps}>
            <ReactLenis root>
              <ToastProvider />
              {children}
              <ReactQueryDevtools buttonPosition='bottom-right' initialIsOpen={false} />
            </ReactLenis>
          </NextThemeProvider>
        </NuqsAdapter>
      </QueryClientProvider>
    </FingerprintProvider>
  );
}
