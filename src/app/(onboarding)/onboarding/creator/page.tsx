import 'server-only';

import type { JSX } from 'react';
import { Suspense } from 'react';

import type { Metadata } from 'next';

import { CreatorOnboardingFlow } from '@/features/onboarding/components/creator-onboarding';
import { OnboardingFlowSkeleton } from '@/features/onboarding/components/onboarding-flow-skeleton';
import { getOnboardingEntry } from '@/features/onboarding/server/entry';
import { readForPage } from '@/server/auth/page-access';

export default function CreatorOnboardingPage() {
  return (
    <Suspense fallback={<OnboardingFlowSkeleton />}>
      <CreatorOnboardingContent />
    </Suspense>
  );
}

async function CreatorOnboardingContent(): Promise<JSX.Element> {
  const user = await readForPage(() => getOnboardingEntry());

  return (
    <div className='flex flex-1 items-center justify-center p-4'>
      <CreatorOnboardingFlow
        user={{
          bio: (user as { bio?: string }).bio || '',
          email: user.email || '',
          firstName: (user as { firstName?: string }).firstName || '',
          lastName: (user as { lastName?: string }).lastName || '',
          name: user.name || '',
          websiteUrl: (user as { websiteUrl?: string }).websiteUrl || '',
          username: (user as { username?: string }).username || '',
          image: (user as { image?: string }).image || '',
          twitterUrl: (user as { twitterUrl?: string }).twitterUrl || '',
          githubUrl: (user as { githubUrl?: string }).githubUrl || ''
        }}
      />
    </div>
  );
}

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: 'Setup Creator Profile'
};
