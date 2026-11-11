import type { JSX } from 'react';

import type { Route } from 'next';
import Link from 'next/link';

import { ArrowRight, Building, Plus } from 'lucide-react';

import type { WorkspaceMembership } from '@/features/organization/types';

interface B2COrgListProps {
  memberships: WorkspaceMembership[];
}

export function B2COrgList({ memberships }: B2COrgListProps): JSX.Element {
  return (
    <div className='flex flex-col gap-5'>
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-xl font-bold tracking-tight text-foreground'>My Workspaces</h3>
          <p className='text-sm text-muted-foreground'>Access your B2B organization and academy workspaces.</p>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
        {memberships.map(({ organization, role }) => (
          <div
            key={organization.id}
            className='group border-default-200/50 relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-background/40 p-6 shadow-sm backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5'
          >
            <div className='pointer-events-none absolute -right-12 -bottom-12 size-[150px] rounded-full bg-primary/5 blur-[50px] transition-all duration-500 group-hover:bg-primary/10' />

            <div className='flex items-start gap-4'>
              <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground'>
                <Building className='size-6' />
              </div>
              <div>
                <h4 className='line-clamp-1 text-base font-bold text-foreground transition-colors group-hover:text-primary'>
                  {organization.name}
                </h4>
                <p className='text-xs text-muted-foreground'>/organization/{organization.slug}</p>
                <div className='mt-2.5'>
                  <span className='bg-default-100 text-default-600 inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase'>
                    {role}
                  </span>
                </div>
              </div>
            </div>

            <div className='mt-8 flex justify-end'>
              <Link
                className='inline-flex items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-primary/85'
                href={`/organization/${organization.slug}` as Route}
              >
                Launch Workspace
                <ArrowRight className='size-4 transition-transform duration-300 group-hover:translate-x-1' />
              </Link>
            </div>
          </div>
        ))}

        {/* Join / Create card */}
        <Link
          className='group border-default-200/50 flex h-full min-h-[160px] flex-col items-center justify-center rounded-2xl border border-dashed bg-background/10 p-6 text-center backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-primary/50 hover:bg-background/30'
          href={'/select-organization' as Route}
        >
          <div className='border-default-200/60 flex h-10 w-10 items-center justify-center rounded-full border border-dashed text-muted-foreground transition-all duration-500 group-hover:border-primary/50 group-hover:bg-primary/10 group-hover:text-primary'>
            <Plus className='size-5 transition-transform duration-500 group-hover:rotate-90' />
          </div>
          <span className='mt-4 text-sm font-bold text-foreground transition-colors group-hover:text-primary'>
            Join or Create Workspace
          </span>
          <p className='mt-1 text-xs text-muted-foreground'>
            Set up a new organization or enter workspace invite codes.
          </p>
        </Link>
      </div>
    </div>
  );
}
