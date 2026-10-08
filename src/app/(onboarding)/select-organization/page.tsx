import 'server-only';

import type { JSX } from 'react';

import { SelectOrganizationList } from '@/features/organization/select-organization-list';
import { loadSelectOrganizationPage } from '@/features/organization/server/loaders/select-organization';
import { readForPage } from '@/server/auth/page-access';

/**
 * Organization selector page displayed after login.
 * Lists all orgs the user belongs to and lets them pick one.
 * Auto-redirects if the user belongs to exactly one org.
 */
export default async function SelectOrganizationPage(): Promise<JSX.Element> {
  const { memberships } = await readForPage(() => loadSelectOrganizationPage());

  return (
    <div className='flex flex-1 items-center justify-center px-4 py-16'>
      <SelectOrganizationList memberships={memberships} />
    </div>
  );
}
