'use client';

import { useQuery } from '@tanstack/react-query';

import { useCurriculumStore } from '@/features/course/store/curriculum-store';

// Client-side fetch fallback (should match prefetch logic)
async function fetchShowroomCourses() {
  return [
    { duration: '4h 30m', id: '1', title: 'Next.js 16 Production Architectures' },
    { duration: '3h 15m', id: '2', title: 'Radix UI and Compound Component Design' },
    { duration: '2h 50m', id: '3', title: 'State Hydration and Edge Computing Options' }
  ];
}

export function DataPatternsClient() {
  // 1. TanStack Query hydration validation
  const { data: courses, isLoading } = useQuery({
    queryFn: fetchShowroomCourses,
    queryKey: ['showroom-courses']
  });

  // 2. Zustand state consumption
  const expandedModuleIds = useCurriculumStore(state => state.expandedModuleIds);
  const toggleModule = useCurriculumStore(state => state.toggleModule);
  const expandAll = useCurriculumStore(state => state.expandAll);
  const collapseAll = useCurriculumStore(state => state.collapseAll);

  const mockModules = [
    {
      id: 'module-1',
      lessons: ['Apps Composition', 'Domain Extraction', 'Leaf Packages'],
      title: 'Module 1: Monorepo Layered Structures'
    },
    {
      id: 'module-2',
      lessons: ['State Leakage Patterns', 'Request Scoping', 'Zustand Context Factories'],
      title: 'Module 2: Client Hydration & SSR Safety'
    },
    {
      id: 'module-3',
      lessons: ['React Query Prefetching', 'URL Search Parameter Stores', 'Local Storage Synced Caches'],
      title: 'Module 3: Distributed State Architectures'
    }
  ];

  const allModuleIds = mockModules.map(m => m.id);

  return (
    <div className='grid gap-8 md:grid-cols-2'>
      {/* TanStack Query Section */}
      <section className='space-y-4 rounded-xl border border-neutral-200 bg-card p-6 dark:border-neutral-800'>
        <div>
          <h2 className='text-xl font-bold tracking-tight'>1. TanStack Query Hydration</h2>
          <p className='mt-1 text-sm text-muted-foreground'>
            Data pre-fetched on the server during rendering and hydrated instantly in the client cache.
          </p>
        </div>

        {isLoading ? (
          <div className='animate-pulse space-y-2 py-4'>
            <div className='h-4 w-3/4 rounded bg-neutral-200 dark:bg-neutral-800' />
            <div className='h-4 w-1/2 rounded bg-neutral-200 dark:bg-neutral-800' />
          </div>
        ) : (
          <div className='space-y-3'>
            {courses?.map(course => (
              <div
                key={course.id}
                className='flex items-center justify-between rounded-lg border border-neutral-200 bg-background/50 p-3 transition-colors hover:border-primary/50 dark:border-neutral-800/50'
              >
                <span className='text-sm font-medium text-neutral-800 dark:text-neutral-200'>{course.title}</span>
                <span className='rounded bg-neutral-100 px-2 py-1 font-mono text-xs text-muted-foreground dark:bg-neutral-800'>
                  {course.duration}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Zustand Section */}
      <section className='space-y-4 rounded-xl border border-neutral-200 bg-card p-6 dark:border-neutral-800'>
        <div>
          <h2 className='text-xl font-bold tracking-tight'>2. Request-Scoped Zustand Store</h2>
          <p className='mt-1 text-sm text-muted-foreground'>
            Isolated visual state builder. Safe from server state leakage on concurrent requests.
          </p>
        </div>

        <div className='flex gap-2'>
          <button
            className='cursor-pointer rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-neutral-50 transition-opacity hover:opacity-90 dark:bg-neutral-50 dark:text-neutral-900'
            onClick={() => expandAll(allModuleIds)}
          >
            Expand All
          </button>
          <button
            className='cursor-pointer rounded-md bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700/80'
            onClick={collapseAll}
          >
            Collapse All
          </button>
        </div>

        <div className='space-y-3'>
          {mockModules.map(mod => {
            const isExpanded = expandedModuleIds.includes(mod.id);
            return (
              <div
                key={mod.id}
                className='overflow-hidden rounded-lg border border-neutral-200 bg-background/50 dark:border-neutral-800/50'
              >
                <button
                  className='flex w-full cursor-pointer items-center justify-between p-4 text-left transition-colors hover:bg-neutral-100/50 dark:hover:bg-neutral-800/30'
                  onClick={() => toggleModule(mod.id)}
                >
                  <span className='text-sm font-semibold text-neutral-800 dark:text-neutral-200'>{mod.title}</span>
                  <span className='text-xs font-semibold text-neutral-500 dark:text-neutral-400'>
                    {isExpanded ? 'Collapse' : 'Expand'}
                  </span>
                </button>

                {isExpanded && (
                  <div className='space-y-2 border-t border-neutral-100 bg-neutral-50/50 px-4 pt-2 pb-4 dark:border-neutral-800/30 dark:bg-neutral-900/10'>
                    {mod.lessons.map((lesson, idx) => (
                      <div key={idx} className='flex items-center gap-2 text-xs text-muted-foreground'>
                        <span className='h-1.5 w-1.5 rounded-full bg-neutral-400 dark:bg-neutral-600' />
                        {lesson}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
