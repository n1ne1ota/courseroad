import type { CSSProperties, ReactNode } from 'react';
import { Suspense } from 'react';

import type { Route } from 'next';

import { parseTenantBranding, tenantBrandingStyles } from '@/lib/utils/tenant-branding';

import { DashboardShellSkeleton } from '@/features/dashboard/shared/shell/dashboard-shell-skeleton';
import { requireOrgRole } from '@/server/auth/require-org-role';

type OrgLayoutProps = { children: ReactNode; params: Promise<{ slug: string }> };

/** Validate URL membership and render branding without mutating session preferences. */
export default function OrgLayout(props: OrgLayoutProps) {
  return (
    <Suspense fallback={<DashboardShellSkeleton />}>
      <AuthorizedOrgLayout {...props} />
    </Suspense>
  );
}

async function AuthorizedOrgLayout({ children, params }: OrgLayoutProps) {
  const { slug } = await params;
  const { organization } = await requireOrgRole('learner', '/select-organization' as Route, slug);
  const branding = parseTenantBranding(organization.metadata, organization.primaryColor, organization.secondaryColor);
  return <div style={tenantBrandingStyles(branding) as CSSProperties}>{children}</div>;
}
