import 'server-only';

import type { JSX } from 'react';

import { AccountSecuritySection } from '@/features/auth/components/account-security-section';
import { OrgSettingsPage } from '@/features/organization/org-settings-page';
import { loadSettingsView } from '@/features/organization/server/loaders/organization-settings-view';
import { readForPage } from '@/server/auth/page-access';

type SettingsViewProps = {
  orgSlug: string;
};

export async function SettingsView({ orgSlug }: SettingsViewProps): Promise<JSX.Element> {
  const { fullOrg, role, orgRoutes } = await readForPage(() => loadSettingsView({ orgSlug }));

  return (
    <div className='px-4 py-8 lg:px-6'>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold tracking-tight'>Settings</h1>
        <p className='mt-1 text-muted-foreground'>Manage your organization and account preferences.</p>
      </div>
      <OrgSettingsPage
        membersUrl={orgRoutes.members}
        orgId={fullOrg.id}
        orgLogo={fullOrg.logo ?? null}
        orgName={fullOrg.name}
        orgSlug={fullOrg.slug}
        platformFeePercent={(fullOrg as { platformFeePercent?: number }).platformFeePercent ?? 10}
        role={role}
        securitySection={<AccountSecuritySection />}
        stripeAccountId={(fullOrg as { stripeAccountId?: string | null }).stripeAccountId ?? null}
        stripeOnboardingComplete={(fullOrg as { stripeOnboardingComplete?: boolean }).stripeOnboardingComplete ?? false}
      />
    </div>
  );
}
