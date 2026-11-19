import type { JSX } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, Skeleton } from '@courseroad/kurume-ui';

/** Skeleton for the checkout page: heading and course summary on the left, payment form card on the right. */
export function CheckoutPageSkeleton(): JSX.Element {
  return (
    <div className='min-h-[calc(100vh-4rem)] bg-muted/10 p-4 md:p-8' aria-hidden='true'>
      <div className='mx-auto grid max-w-6xl grid-cols-1 gap-12 lg:grid-cols-2'>
        <div className='space-y-8 lg:pr-8'>
          <div className='space-y-4 pt-4 md:pt-12'>
            <h1 className='text-3xl font-extrabold tracking-tight md:text-4xl lg:text-5xl'>Secure Checkout</h1>
            <p className='text-muted-foreground md:text-lg'>Complete your purchase to get lifetime access.</p>
          </div>

          <Card className='overflow-hidden bg-background/50 shadow-sm'>
            <Skeleton className='aspect-video w-full rounded-none' />
            <CardHeader className='pb-4'>
              <Skeleton className='mb-2 h-5 w-28' shape='text' />
              <Skeleton className='h-8 w-3/4' shape='text' />
            </CardHeader>
            <CardContent>
              <div className='mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6'>
                <div className='space-y-2'>
                  <Skeleton className='h-5 w-36' shape='text' />
                  <Skeleton className='h-5 w-24' shape='text' />
                </div>
                <div className='flex flex-col items-end gap-1'>
                  <div className='text-xs font-semibold tracking-wider text-muted-foreground uppercase'>
                    Total to pay
                  </div>
                  <Skeleton className='h-10 w-24' shape='text' />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className='pt-4 md:pt-12'>
          <Card className='shadow-xl'>
            <CardHeader className='border-b border-border bg-muted/20 pb-6'>
              <CardTitle className='text-xl'>Payment Details</CardTitle>
              <CardDescription>All transactions are secure and encrypted via Stripe.</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4 pt-8'>
              <Skeleton className='h-10 w-full' />
              <div className='grid grid-cols-2 gap-4'>
                <Skeleton className='h-10 w-full' />
                <Skeleton className='h-10 w-full' />
              </div>
              <Skeleton className='h-11 w-full' />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
