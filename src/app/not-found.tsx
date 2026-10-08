'use client';

import type { Route } from 'next';
import Link from 'next/link';

import { Button } from '@courseroad/iota-ui';

export default function NotFound() {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center px-4'>
      <div className='mx-auto max-w-md text-center'>
        <h1 className='text-9xl font-bold text-primary'>404</h1>
        <h2 className='mt-4 text-2xl font-semibold'>Page Not Found</h2>
        <p className='mt-2 text-muted-foreground'>Sorry, we couldn&apos;t find the page you&apos;re looking for.</p>
        <div className='mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center'>
          <Button color='primary' render={<Link href='/' />}>
            Go Home
          </Button>
          <Button render={<Link href={'/courses' as Route} />} variant='bordered'>
            Browse Courses
          </Button>
        </div>
      </div>
    </div>
  );
}
