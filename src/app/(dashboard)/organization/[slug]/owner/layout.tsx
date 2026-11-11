import 'server-only';

import type { Route } from 'next';

import { requireOrgRole } from '@/server/auth/require-org-role';

type OwnerLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

export default async function OwnerLayout({ children, params }: OwnerLayoutProps) {
  const { slug } = await params;
  await requireOrgRole('owner', `/organization/${slug}/learner/dashboard` as Route, slug);
  return <>{children}</>;
}
