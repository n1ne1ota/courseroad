import { cookies } from 'next/headers';

import { HydrationBoundary } from '@tanstack/react-query';

import { CurriculumStoreProvider } from '@/features/course/store/curriculum-store';
import { prefetchQuery } from '@/server/query/prefetch';

import { DataPatternsClient } from './_components/data-patterns-client';

// Simple mock resolver to simulate database query response latency
async function fetchShowroomCourses() {
  return [
    { duration: '4h 30m', id: '1', title: 'Next.js 16 Production Architectures' },
    { duration: '3h 15m', id: '2', title: 'Radix UI and Compound Component Design' },
    { duration: '2h 50m', id: '3', title: 'State Hydration and Edge Computing Options' }
  ];
}

export default async function DataPatternsPage() {
  // Opt out of static prerendering using request headers/cookies to make Date.now() allowed during prefetch.
  await cookies();

  // Prefetch queries on the server
  const dehydratedState = await prefetchQuery(['showroom-courses'], fetchShowroomCourses);

  return (
    <main className='mx-auto max-w-4xl space-y-8 p-8'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>ARCH-143: Architectural Data Patterns</h1>
        <p className='mt-2 text-muted-foreground'>
          Demonstrating server-side TanStack Query prefetching and SSR-safe request-scoped Zustand stores.
        </p>
      </div>

      <CurriculumStoreProvider initialValue={{ expandedModuleIds: ['module-1'] }}>
        <HydrationBoundary state={dehydratedState}>
          <DataPatternsClient />
        </HydrationBoundary>
      </CurriculumStoreProvider>
    </main>
  );
}
