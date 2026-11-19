import type { JSX } from 'react';

import { Skeleton } from '@courseroad/kurume-ui';

import { EditorCardSkeleton, EditorPageSkeleton } from '@/components/shared/editor-page-skeleton';

/**
 * Skeleton for `CourseEditor` on its Details tab: identity and description cards on the left,
 * with the sticky settings and media cards on the right at wide widths.
 */
export function CourseEditorSkeleton(): JSX.Element {
  return (
    <EditorPageSkeleton title='Course Editor'>
      <div className='grid grid-cols-1 gap-6 2xl-screen:grid-cols-3'>
        <div className='space-y-6 2xl-screen:col-span-2'>
          <EditorCardSkeleton twoColumn fields={4} />
          <EditorCardSkeleton fields={2} />
        </div>
        <div className='2xl-screen:col-span-1'>
          <div className='space-y-6'>
            <EditorCardSkeleton fields={0} />
            <EditorCardSkeleton fields={0} />
            <Skeleton className='aspect-video w-full rounded-lg' />
          </div>
        </div>
      </div>
    </EditorPageSkeleton>
  );
}
