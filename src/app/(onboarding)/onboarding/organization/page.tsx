import 'server-only';

import type { JSX } from 'react';
import { Suspense } from 'react';

import type { Metadata } from 'next';

import { OnboardingFlowSkeleton } from '@/features/onboarding/components/onboarding-flow-skeleton';
import { OrganizationOnboardingFlow } from '@/features/onboarding/components/organization-onboarding';
import { getOnboardingEntry } from '@/features/onboarding/server/entry';
import { readForPage } from '@/server/auth/page-access';

export default function OrganizationOnboardingPage() {
  return (
    <Suspense fallback={<OnboardingFlowSkeleton />}>
      <OrganizationOnboardingContent />
    </Suspense>
  );
}

async function OrganizationOnboardingContent(): Promise<JSX.Element> {
  await readForPage(() => getOnboardingEntry());

  return (
    <div className='flex flex-1 items-center justify-center p-4'>
      <OrganizationOnboardingFlow />
    </div>
  );
}

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: 'Setup Workspace'
};
