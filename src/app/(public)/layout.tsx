import type { ReactNode } from 'react';
import { Suspense } from 'react';

import { Footer } from '@/components/layout/footer';
import { SiteNavigation } from '@/components/layout/site-navigation';
import { SiteNavigationSkeleton } from '@/components/layout/site-navigation-skeleton';

import { LandingBackground } from '@/features/landing/landing-background';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className='flex min-h-screen flex-col'>
      {/* Mounted here so it persists across public route navigation, keeping the same pixel pattern. */}
      <Suspense fallback={null}>
        <LandingBackground />
      </Suspense>
      <Suspense fallback={<SiteNavigationSkeleton />}>
        <SiteNavigation />
      </Suspense>
      {/*
        No generic fallback: a placeholder cannot match every page. Pages are static or suspend their
        own data behind a colocated skeleton, so this boundary only has to keep the frame in place.
      */}
      <main className='flex flex-1 flex-col'>
        <Suspense fallback={null}>{children}</Suspense>
      </main>
      <Footer />
    </div>
  );
}
