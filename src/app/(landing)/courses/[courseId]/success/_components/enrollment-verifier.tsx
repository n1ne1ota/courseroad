'use client';

import { useEffect, useState } from 'react';

import type { Route } from 'next';
import Link from 'next/link';

import { Button } from '@courseroad/kurume-ui/components/button/button';
import confetti from 'canvas-confetti';
import { CheckCircle2, Loader2, MoveRight, Sparkles } from 'lucide-react';

interface EnrollmentVerifierProps {
  courseId: string;
}

export function EnrollmentVerifier({ courseId }: EnrollmentVerifierProps) {
  const [isVerifying, setIsVerifying] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [learnHref, setLearnHref] = useState(`/learner/dashboard/learn/${courseId}`);

  useEffect(() => {
    let isCancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const verifyEnrollment = async (attempt = 0) => {
      try {
        const response = await fetch(`/api/courses/${courseId}/enrollment`, { cache: 'no-store' });
        const result = await response.json();

        if (isCancelled) {
          return;
        }

        if (response.ok && result.data?.isEnrolled) {
          setIsEnrolled(true);
          setLearnHref(result.data.learnHref);
          setIsVerifying(false);

          confetti({
            colors: ['#0054ff', '#10b981', '#3b82f6', '#f59e0b'],
            origin: { y: 0.6 },
            particleCount: 150,
            spread: 70
          });
          return;
        }

        if (attempt < 10) {
          timeoutId = setTimeout(() => {
            void verifyEnrollment(attempt + 1);
          }, 3000);
          return;
        }
      } catch {
        if (isCancelled) {
          return;
        }

        if (attempt < 10) {
          timeoutId = setTimeout(() => {
            void verifyEnrollment(attempt + 1);
          }, 3000);
          return;
        }
      }

      if (!isCancelled) {
        setIsVerifying(false);
      }
    };

    void verifyEnrollment();

    return () => {
      isCancelled = true;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [courseId]);

  if (isVerifying) {
    return (
      <div className='flex min-h-[50vh] flex-col items-center justify-center space-y-6 px-4 text-center'>
        <div className='relative flex items-center justify-center'>
          <div className='absolute size-16 animate-ping rounded-full bg-primary/20' />
          <div className='relative flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary'>
            <Loader2 className='size-8 animate-spin' />
          </div>
        </div>
        <div className='max-w-sm space-y-2'>
          <h2 className='text-2xl font-bold tracking-tight'>Verifying payment...</h2>
          <p className='text-muted-foreground'>
            Please hang tight while we confirm your transaction securely. This usually takes just a few seconds.
          </p>
        </div>
      </div>
    );
  }

  if (isEnrolled) {
    return (
      <div className='flex min-h-[50vh] flex-col items-center justify-center space-y-8 px-4 text-center'>
        <div className='flex size-20 items-center justify-center rounded-full bg-success/20 text-success shadow-[0_0_40px_rgba(16,185,129,0.3)]'>
          <CheckCircle2 className='size-10' />
        </div>
        <div className='max-w-md space-y-3'>
          <h2 className='text-3xl font-extrabold tracking-tight'>Payment Successful!</h2>
          <p className='text-lg text-muted-foreground'>
            Welcome aboard. Your payment has been confirmed and you now have full access to the course.
          </p>
        </div>
        <Button className='group mt-4 shadow-lg' asChild size='lg' variant='primary'>
          <Link href={learnHref as Route}>
            <Sparkles className='mr-2 size-4 text-primary-foreground/80' />
            Start Learning Now
            <MoveRight className='ml-2 size-4 transition-transform group-hover:translate-x-1' />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className='flex min-h-[50vh] flex-col items-center justify-center space-y-6 px-4 text-center'>
      <div className='flex size-20 items-center justify-center rounded-full bg-warning/20 text-warning'>
        <Loader2 className='size-10 animate-spin opacity-50' />
      </div>
      <div className='max-w-md space-y-3'>
        <h2 className='text-2xl font-bold tracking-tight'>We are still processing</h2>
        <p className='text-muted-foreground'>
          Your payment might still be processing. You can check back on the course page in a few minutes.
        </p>
      </div>
      <div className='flex gap-4 pt-4'>
        <Button asChild variant='outline'>
          <Link href={`/courses/${courseId}` as Route}>Return to Course</Link>
        </Button>
      </div>
    </div>
  );
}
