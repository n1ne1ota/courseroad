import Link from 'next/link';

import { Alert, AlertDescription, AlertTitle } from '@courseroad/kurume-ui/components/alert/alert';
import { Button } from '@courseroad/kurume-ui/components/button/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@courseroad/kurume-ui/components/card/card';

export default function PaymentsSuccessTestPage() {
  return (
    <div className='flex min-h-[80vh] items-center justify-center p-4'>
      <Card className='w-full max-w-md border-green-500/20 bg-green-500/5'>
        <CardHeader>
          <CardTitle className='text-green-500'>Payment Successful! 🎉</CardTitle>
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
          <Button className='w-full' asChild>
            <Link href='/demo/payments'>Run Another Test</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
