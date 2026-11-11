import type { JSX } from 'react';

export function LearnersView(): JSX.Element {
  return (
    <div className='p-4'>
      <h1 className='text-2xl font-bold'>My Learners</h1>
      <p className='mt-2 text-muted-foreground'>List of enrolled learners will appear here.</p>
    </div>
  );
}
