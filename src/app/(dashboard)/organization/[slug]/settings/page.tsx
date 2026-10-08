import type { Route } from 'next';
import { redirect } from 'next/navigation';

import { requireOrgRole } from '@/server/auth/require-org-role';

/** Route shortcut derived from verified URL organization membership. */
export default async function OrganizationRedirect({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { member } = await requireOrgRole('learner', '/select-organization' as Route, slug);
  const role = member.role.toLowerCase();
  redirect(`/organization/${slug}/${role}/dashboard${['owner', 'manager'].includes(role) ? '/settings' : ''}` as Route);
}
