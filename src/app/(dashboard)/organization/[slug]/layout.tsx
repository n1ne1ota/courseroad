import type { CSSProperties, ReactNode } from 'react';

import type { Route } from 'next';

import { parseTenantBranding, tenantBrandingStyles } from '@/lib/utils/tenant-branding';

import { requireOrgRole } from '@/server/auth/require-org-role';

/** Validate URL membership and render branding without mutating session preferences. */
export default async function OrgLayout({
  children,
  params
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { organization } = await requireOrgRole('learner', '/select-organization' as Route, slug);
  const branding = parseTenantBranding(organization.metadata, organization.primaryColor, organization.secondaryColor);
  return <div style={tenantBrandingStyles(branding) as CSSProperties}>{children}</div>;
}
