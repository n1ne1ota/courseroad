import type { Route } from 'next';
import { redirect } from 'next/navigation';

import { Alert, AlertDescription, AlertTitle } from '@courseroad/kurume-ui/components/alert/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@courseroad/kurume-ui/components/card/card';
import { AlertCircle, BookOpen, Crown } from 'lucide-react';

import { CheckoutInitializer } from '@/features/payment/components/checkout-initializer';
import {
  getCheckoutEnrollment,
  loadCheckoutPage
} from '@/features/payment/server/loaders/public-courses-course-checkout';
import { readForPage } from '@/server/auth/page-access';

export default async function CheckoutPage(props: { params: Promise<{ courseId: string }> }) {
  const { courseId, course, imageUrl, creatorName, displayPrice, totalLessons } = await readForPage(() =>
    loadCheckoutPage(props)
  );

  if (!course.price || course.price <= 0) {
    return (
      <div className='mx-auto max-w-xl px-4 py-20'>
        <Alert>
          <AlertCircle className='size-4' />
          <AlertTitle>Free Course</AlertTitle>
          <AlertDescription>
            This course is free. Please enroll from the main course page instead of the checkout page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const existingEnrollment = await readForPage(() => getCheckoutEnrollment(course.id));
  if (existingEnrollment) redirect(existingEnrollment as Route);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const returnUrl = `${baseUrl}/courses/${courseId}/success`;

  return (
    <div className='min-h-[calc(100vh-4rem)] bg-muted/10 p-4 md:p-8'>
      <div className='mx-auto grid max-w-6xl grid-cols-1 gap-12 lg:grid-cols-2'>
        <div className='space-y-8 lg:pr-8'>
          <div className='space-y-4 pt-4 md:pt-12'>
            <h1 className='text-3xl font-extrabold tracking-tight md:text-4xl lg:text-5xl'>Secure Checkout</h1>
            <p className='text-muted-foreground md:text-lg'>Complete your purchase to get lifetime access.</p>
          </div>

          <Card className='border-default-200/50 overflow-hidden bg-background/50 shadow-sm'>
            <div className='border-default-100 bg-default-100 aspect-video w-full border-b'>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className='h-full w-full object-cover' alt={course.title} src={imageUrl} />
            </div>
            <CardHeader className='pb-4'>
              <div className='mb-2 flex items-center gap-3 text-sm font-semibold tracking-wider text-muted-foreground uppercase'>
                <span>{course.category || 'General'}</span>
              </div>
              <CardTitle className='text-2xl leading-tight'>{course.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='border-default-100 mt-4 flex flex-wrap items-center justify-between gap-4 border-t pt-6'>
                <div className='space-y-2'>
                  <div className='flex items-center gap-2 text-sm font-medium text-foreground/80'>
                    <Crown className='size-4 text-primary' /> By {creatorName}
                  </div>
                  <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                    <BookOpen className='size-4 text-muted-foreground/80' /> {totalLessons} Lessons
                  </div>
                </div>
                <div className='text-right'>
                  <div className='mb-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase'>
                    Total to pay
                  </div>
                  <div className='text-3xl font-extrabold lg:text-4xl'>{displayPrice}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className='pt-4 md:pt-12'>
          <Card className='border-default-200/50 shadow-xl'>
            <CardHeader className='border-default-100/50 border-b bg-muted/20 pb-6'>
              <CardTitle className='text-xl'>Payment Details</CardTitle>
              <CardDescription>All transactions are secure and encrypted via Stripe.</CardDescription>
            </CardHeader>
            <CardContent className='pt-8'>
              <CheckoutInitializer courseId={course.id} returnUrl={returnUrl} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
