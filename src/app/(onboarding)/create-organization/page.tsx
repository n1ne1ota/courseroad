import 'server-only';

import type { JSX } from 'react';

import { CreateOrganizationForm } from '@/features/organization/create-organization-form';
import { loadCreateOrganizationPage } from '@/features/organization/server/loaders/create-organization';
import { readForPage } from '@/server/auth/page-access';

/**
 * Server page for creating a new organization.
 * Gates access to authenticated users only.
 */
export default async function CreateOrganizationPage(): Promise<JSX.Element> {
  const {} = await readForPage(() => loadCreateOrganizationPage());

  return (
    <div className='flex flex-1 items-center justify-center px-4 py-16'>
      <CreateOrganizationForm />
    </div>
  );
}
