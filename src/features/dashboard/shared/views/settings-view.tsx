import 'server-only';

import type { JSX } from 'react';
import { Suspense } from 'react';

import { AccountSecuritySection } from '@/features/auth/components/account-security-section';
import { DashboardPageShell } from '@/features/dashboard/shared/ui/dashboard-page-shell';
import { OrgSettingsPage } from '@/features/organization/components/org-settings-page';
import { OrgSettingsPageSkeleton } from '@/features/organization/components/org-settings-page-skeleton';
import { loadSettingsView } from '@/features/organization/server/loaders/organization-settings-view';
import { readForPage } from '@/server/auth/page-access';

type SettingsViewProps = {
  orgSlug: string;
};

async function SettingsContent({ orgSlug }: SettingsViewProps): Promise<JSX.Element> {
  const { fullOrg, role, orgRoutes } = await readForPage(() => loadSettingsView({ orgSlug }));

  return (
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
  );
}

/** Static heading streams first; the tabbed settings form suspends on its own skeleton. */
export function SettingsView({ orgSlug }: SettingsViewProps): JSX.Element {
  return (
    <DashboardPageShell description='Manage your organization and account preferences.' title='Settings'>
      <Suspense fallback={<OrgSettingsPageSkeleton />}>
        <SettingsContent orgSlug={orgSlug} />
      </Suspense>
    </DashboardPageShell>
  );
}
