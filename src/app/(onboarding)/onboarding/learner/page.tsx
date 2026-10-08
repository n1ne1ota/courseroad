import 'server-only';

import type { JSX } from 'react';

import type { Metadata } from 'next';

import { LearnerOnboardingFlow } from '@/features/onboarding/learner-onboarding';
import { getOnboardingEntry } from '@/features/onboarding/server/entry';
import { readForPage } from '@/server/auth/page-access';

export default async function LearnerOnboardingPage(): Promise<JSX.Element> {
  const user = await readForPage(() => getOnboardingEntry());

  return (
    <div className='flex flex-1 items-center justify-center p-4'>
      <LearnerOnboardingFlow
        user={{
          bio: (user as { bio?: string }).bio || '',
          email: user.email || '',
          firstName: (user as { firstName?: string }).firstName || '',
          lastName: (user as { lastName?: string }).lastName || '',
          name: user.name || '',
          username: (user as { username?: string }).username || '',
          image: (user as { image?: string }).image || ''
        }}
      />
    </div>
  );
}

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: 'Setup Learner Profile'
};
