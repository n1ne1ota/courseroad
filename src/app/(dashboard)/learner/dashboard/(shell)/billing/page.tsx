import type { JSX } from 'react';
import { Suspense } from 'react';

import { BillingSection } from '@/features/dashboard/platform/learner/billing-section';
import { BillingSectionSkeleton } from '@/features/dashboard/platform/learner/billing-section-skeleton';
import { loadBillingContent } from '@/features/payment/server/loaders/platform-learner-billing';
import { readForPage } from '@/server/auth/page-access';

async function BillingContent() {
  const { unifiedPurchases } = await readForPage(() => loadBillingContent());
  return <BillingSection purchases={unifiedPurchases} />;
}

export default function LearnerBillingPage(): JSX.Element {
  return (
    <>
      <Suspense fallback={<BillingSectionSkeleton />}>
        <BillingContent />
      </Suspense>
    </>
  );
}
