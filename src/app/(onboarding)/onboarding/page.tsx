import 'server-only';

import type { JSX } from 'react';

import type { Metadata } from 'next';

import { OnboardingWizard } from '@/features/onboarding/onboarding-wizard';
import { getOnboardingEntry } from '@/features/onboarding/server/entry';
import { readForPage } from '@/server/auth/page-access';

/**
 * Onboarding landing/selection page inside the (onboarding) layout.
 * Gates access via onboardingGuard and routes users to sub-paths.
 */
export default async function SetupPage(): Promise<JSX.Element> {
  const user = await readForPage(() => getOnboardingEntry());
  const displayName = user.name || user.email?.split('@')[0] || 'there';

  return (
    <div className='flex flex-1 items-center justify-center p-4'>
      <OnboardingWizard userName={displayName} />
    </div>
  );
}

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: 'Choose Onboarding Path'
};
