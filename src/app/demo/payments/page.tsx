import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@courseroad/kurume-ui/components/card/card';

import { initializeDemoCheckout } from '@/features/payment/actions/demo-actions';
import { CheckoutInitializer } from '@/features/payment/components/checkout-initializer';

export default function PaymentsTestPage() {
  return (
    <div className='flex min-h-[80vh] items-center justify-center p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader>
          <CardTitle>Test Checkout</CardTitle>
          <CardDescription>
            This is a temporary page to safely test the Payments UI & Webhooks. Use the 4242 test card!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CheckoutInitializer
            courseId='mock-course-123'
            initialize={initializeDemoCheckout}
            returnUrl='http://localhost:3000/demo/payments/success'
          />
        </CardContent>
      </Card>
    </div>
  );
}
