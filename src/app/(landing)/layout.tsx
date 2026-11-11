import type { ReactNode } from 'react';
import { Suspense } from 'react';

import { Footer } from '@/components/layout/footer';
import { Navigation } from '@/components/layout/navigation';
import { NavigationSkeleton } from '@/components/layout/navigation-skeleton';
import { PageSkeleton } from '@/components/layout/page-skeleton';

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className='flex min-h-screen flex-col'>
      <Suspense fallback={<NavigationSkeleton />}>
        <Navigation />
      </Suspense>
      <main className='flex flex-1 flex-col'>
        <Suspense fallback={<PageSkeleton />}>{children}</Suspense>
      </main>
      <Footer />
    </div>
  );
}
