import Link from 'next/link';

import { Alert, AlertDescription, AlertTitle } from '@courseroad/kurume-ui/components/alert/alert';
import { buttonVariants } from '@courseroad/kurume-ui/components/button/button-variants';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@courseroad/kurume-ui/components/card/card';

export default function PaymentsSuccessTestPage() {
  return (
    <div className='flex min-h-[80vh] items-center justify-center p-4'>
      <Card className='w-full max-w-md border-success/20 bg-success/5'>
        <CardHeader>
          <CardTitle className='text-success'>Payment Successful! 🎉</CardTitle>
          <CardDescription>You have successfully reached the return URL.</CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col gap-4'>
          <Alert className='bg-background' variant='default'>
            <AlertTitle>Check your Webhook!</AlertTitle>
            <AlertDescription>
              Look at the terminal where `stripe listen` is running (forwarding to `/api/payments/webhook`). You should
              see a `payment_intent.succeeded` event.
              <br />
              <br />
              Check Prisma Studio to see if a `Purchase` and `Enrollment` record were mockingly created!
            </AlertDescription>
          </Alert>
          <Link className={buttonVariants({ className: 'w-full' })} href='/demo/payments' data-slot='button-link'>
            Run Another Test
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
