import type { JSX } from 'react';
import { Suspense } from 'react';

import { PageSkeleton } from '@/components/layout/page-skeleton';

import { BillingSection } from '@/features/dashboard/platform/learner/billing-section';
import { DashboardPlatformLayout } from '@/features/dashboard/shared/shell/dashboard-platform-layout';
import { loadBillingContent } from '@/features/payment/server/loaders/platform-learner-billing';
import { readForPage } from '@/server/auth/page-access';

async function BillingContent() {
  const { unifiedPurchases } = await readForPage(() => loadBillingContent());

  return (
    <div className='px-4 pt-6 pb-12 lg:px-6'>
      <BillingSection purchases={unifiedPurchases} />
    </div>
  );
}

export default function LearnerBillingPage(): JSX.Element {
  return (
    <DashboardPlatformLayout role='learner' title='Billing & Invoices'>
      <Suspense fallback={<PageSkeleton />}>
        <BillingContent />
      </Suspense>
    </DashboardPlatformLayout>
  );
}
