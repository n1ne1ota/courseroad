import type { ReactNode } from 'react';

import { Card } from '@courseroad/iota-ui';

/** A highlighted note inside an article, for MDX: `<Callout title='Heads up'>...</Callout>`. Built on an Iota Card. */
export function Callout({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <Card className='my-6 p-5' role='note' shadow='sm' variant='solid'>
      {title ? <p className='mb-2 text-sm font-semibold text-foreground'>{title}</p> : null}
      <div className='text-sm leading-relaxed text-muted-foreground [&>*:first-child]:mt-0 [&>*:last-child]:mb-0'>
        {children}
      </div>
    </Card>
  );
}
