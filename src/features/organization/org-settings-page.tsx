'use client';

import { type ReactNode, useState } from 'react';

import type { Route } from 'next';
import Link from 'next/link';

import { Separator, Tabs } from '@courseroad/kurume-ui';
import { Lock, Settings, Shield, Users } from 'lucide-react';

import { OrgDangerZone } from './org-danger-zone';
import { OrgGeneralForm } from './org-general-form';
import { PaymentConnectCard, resolveStatus } from './payment-connect-card';

type SettingsTab = 'general' | 'members' | 'billing' | 'security' | 'danger';

type OrgSettingsPageProps = {
  securitySection: ReactNode;
  membersUrl: string;
  orgId: string;
  orgLogo: string | null;
  orgName: string;
  orgSlug: string;
  platformFeePercent: number;
  role: string;
  stripeAccountId: string | null;
  stripeOnboardingComplete: boolean;
};

const tabOptions = [
  { icon: <Settings className='size-4' />, label: 'General', value: 'general' as const },
  { icon: <Users className='size-4' />, label: 'Members', value: 'members' as const },
  { icon: <Lock className='size-4' />, label: 'Security', value: 'security' as const },
  { label: 'Billing', value: 'billing' as const },
  { icon: <Shield className='size-4' />, label: 'Danger Zone', value: 'danger' as const }
];

/**
 * Tabbed settings page for organization configuration.
 * Role-gated: only owners see Billing and Danger Zone tabs.
 */
export function OrgSettingsPage({
  securitySection,
  membersUrl,
  orgId,
  orgLogo,
  orgName,
  orgSlug,
  platformFeePercent,
  role,
  stripeAccountId,
  stripeOnboardingComplete
}: OrgSettingsPageProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  const isOwner = role === 'owner';
  const isManager = role === 'manager' || isOwner;

  const visibleTabs = tabOptions.filter(tab => {
    if (tab.value === 'billing' || tab.value === 'danger') return isOwner;
    return true;
  });

  const stripeStatus = resolveStatus(stripeAccountId, stripeOnboardingComplete);

  return (
    <div className='space-y-6'>
      <Tabs options={visibleTabs} value={activeTab} onValueChange={setActiveTab} />

      <Separator />

      {activeTab === 'general' && isManager && (
        <OrgGeneralForm orgId={orgId} orgLogo={orgLogo} orgName={orgName} orgSlug={orgSlug} />
      )}

      {activeTab === 'members' && (
        <div className='space-y-4'>
          <div className='space-y-1'>
            <h3 className='text-lg font-semibold'>Members</h3>
            <p className='text-sm text-muted-foreground'>Manage who has access to this organization.</p>
          </div>
          <Link
            className='inline-flex items-center gap-2 rounded-lg border bg-background px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted'
            href={membersUrl as Route}
          >
            <Users className='size-4' />
            Go to Member Management
          </Link>
        </div>
      )}

      {activeTab === 'billing' && isOwner && (
        <PaymentConnectCard
          orgId={orgId}
          platformFeePercent={platformFeePercent}
          status={stripeStatus}
          stripeAccountId={stripeAccountId}
        />
      )}

      {activeTab === 'security' && securitySection}

      {activeTab === 'danger' && isOwner && <OrgDangerZone orgId={orgId} orgName={orgName} />}
    </div>
  );
}
