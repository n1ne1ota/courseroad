import 'server-only';

import type { Route } from 'next';

import { requireOrgRole } from '@/server/auth/require-org-role';

type ManagerLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

export default async function ManagerLayout({ children, params }: ManagerLayoutProps) {
  const { slug } = await params;
  await requireOrgRole('manager', `/organization/${slug}/learner/dashboard` as Route, slug);
  return <>{children}</>;
}
