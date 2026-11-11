import './globals.css';

import type { ReactNode } from 'react';
import { Suspense } from 'react';

import type { Metadata, Viewport } from 'next';

import clsx from 'clsx';

import { globalData } from '@/lib/config/data';
import { env } from '@/lib/config/env';
import { fontMono, fontSans } from '@/lib/config/fonts';

import { PageSkeleton } from '@/components/layout/page-skeleton';

import { Providers } from './providers';

export const metadata: Metadata = {
  alternates: {
    canonical: '/'
  },
  description: globalData.description,
  icons: {
    apple: '/apple-touch-icon.png',
    icon: '/favicon.ico'
  },
  manifest: '/site.webmanifest',
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL ?? globalData.url),
  openGraph: {
    images: ['/opengraph-image.png'],
    siteName: globalData.name,
    type: 'website',
    url: '/'
  },
  title: {
    default: globalData.name,
    template: `%s | ${globalData.name}`
  },
  twitter: {
    card: 'summary_large_image'
  }
};

export const viewport: Viewport = {
  themeColor: [
    { color: 'white', media: '(prefers-color-scheme: light)' },
    { color: 'black', media: '(prefers-color-scheme: dark)' }
  ]
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html suppressHydrationWarning lang='en'>
      <body
        className={clsx(
          'min-h-screen bg-background font-sans text-foreground antialiased',
          fontSans.variable,
          fontMono.variable
        )}
      >
        <Providers themeProps={{ attribute: 'class', defaultTheme: 'dark' }}>
          <div className='flex min-h-screen flex-col'>
            <main className='flex flex-1 flex-col'>
              <Suspense fallback={<PageSkeleton />}>{children}</Suspense>
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
