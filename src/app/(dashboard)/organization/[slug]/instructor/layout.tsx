import 'server-only';

import type { Route } from 'next';

import { requireOrgRole } from '@/server/auth/require-org-role';

type InstructorLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

export default async function InstructorLayout({ children, params }: InstructorLayoutProps) {
  const { slug } = await params;
  await requireOrgRole('instructor', `/organization/${slug}/learner/dashboard` as Route, slug);
  return <>{children}</>;
}
