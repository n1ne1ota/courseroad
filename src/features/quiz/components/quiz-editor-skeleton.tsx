import type { JSX } from 'react';

import { Skeleton } from '@courseroad/kurume-ui';

import { EditorCardSkeleton, EditorPageSkeleton } from '@/components/shared/editor-page-skeleton';

/**
 * Skeleton for `QuizEditor` on its Details tab: details and cover cards on the left,
 * with the settings card (toggle rows) on the right at wide widths.
 */
export function QuizEditorSkeleton(): JSX.Element {
  return (
    <EditorPageSkeleton title='Quiz Editor'>
      <div className='grid grid-cols-1 gap-6 4xl-screen:grid-cols-5'>
        <div className='space-y-6 4xl-screen:col-span-3'>
          <EditorCardSkeleton fields={2} />
          <EditorCardSkeleton fields={0} />
        </div>
        <div className='space-y-6 4xl-screen:col-span-2'>
          <EditorCardSkeleton fields={0} />
          <div className='grid grid-cols-1 gap-4 2xl-screen:grid-cols-2'>
            {[0, 1, 2, 3].map(i => (
              <Skeleton key={i} className='h-16 w-full rounded-lg' />
            ))}
          </div>
        </div>
      </div>
    </EditorPageSkeleton>
  );
}
