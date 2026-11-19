import type { JSX, ReactNode } from 'react';

import { Card, CardContent, CardDescription, CardHeader, Skeleton } from '@courseroad/kurume-ui';

type EditorPageSkeletonProps = {
  /** Body for the active tab, rendered under the tab bar. */
  children: ReactNode;
  /** Number of placeholder tabs; matches the editor's tab list. */
  tabCount?: number;
  /** Static page title, matching the real editor's `<h1>`. The subtitle (item name) is dynamic. */
  title: string;
};

/**
 * Frame shared by the course and quiz editors: heading, tab bar with a Save button, then the tab body.
 * The title renders for real; only the subtitle, tabs, and body are placeholders.
 */
export function EditorPageSkeleton({ children, tabCount = 3, title }: EditorPageSkeletonProps): JSX.Element {
  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>{title}</h1>
          <Skeleton className='mt-1.5 h-5 w-56' shape='text' />
        </div>
      </div>

      <div className='w-full'>
        <div className='flex w-full items-center justify-between'>
          <div className='flex gap-1'>
            {Array.from({ length: tabCount }, (_, i) => (
              <Skeleton key={i} className='h-9 w-24 rounded-lg' />
            ))}
          </div>
          <Skeleton className='h-9 w-36' />
        </div>
        <div className='mt-6'>{children}</div>
      </div>
    </div>
  );
}

type EditorCardSkeletonProps = {
  /** Field rows laid out in the card body. */
  fields?: number;
  /** Render the fields as two columns on wider screens. */
  twoColumn?: boolean;
};

/** Card with an icon title, a description line, and labelled field placeholders. */
export function EditorCardSkeleton({ fields = 2, twoColumn = false }: EditorCardSkeletonProps): JSX.Element {
  return (
    <Card>
      <CardHeader>
        <div className='flex items-center gap-2'>
          <Skeleton className='size-8 rounded-lg' />
          <Skeleton className='h-5 w-40' shape='text' />
        </div>
        <CardDescription>
          <Skeleton className='h-4 w-64 max-w-full' shape='text' />
        </CardDescription>
      </CardHeader>
      <CardContent className={twoColumn ? 'grid grid-cols-1 gap-6 xs-screen:grid-cols-2' : 'space-y-6'}>
        {Array.from({ length: fields }, (_, i) => (
          <div key={i} className='space-y-2'>
            <Skeleton className='h-4 w-28' shape='text' />
            <Skeleton className='h-9 w-full' />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
