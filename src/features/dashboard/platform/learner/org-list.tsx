import type { JSX } from 'react';

import type { Route } from 'next';
import Link from 'next/link';

import { ArrowRight, Building, Plus } from 'lucide-react';

import { cn } from '@/lib/utils/cn';

import { glassCardClass, workspaceGridClass } from '@/features/dashboard/shared/ui/dashboard-surfaces';

import type { WorkspaceMembership } from '@/features/organization/types/types';

interface B2COrgListProps {
  memberships: WorkspaceMembership[];
}

/** Section heading, rendered in the page's static shell so only the grid streams. */
export function B2COrgListHeader(): JSX.Element {
  return (
    <div>
      <h3 className='text-xl font-bold tracking-tight text-foreground'>My Workspaces</h3>
      <p className='text-sm text-muted-foreground'>Access your B2B organization and academy workspaces.</p>
    </div>
  );
}

export function B2COrgList({ memberships }: B2COrgListProps): JSX.Element {
  return (
    <div className={workspaceGridClass}>
      {memberships.map(({ organization, role }) => (
        <div
          key={organization.id}
          className={cn(
            glassCardClass,
            'group justify-between p-6 transition-all duration-500 hover:-translate-y-1 hover:border-brand/50 hover:shadow-lg hover:shadow-brand/5'
          )}
        >
          <div className='pointer-events-none absolute -right-12 -bottom-12 size-[150px] rounded-full bg-brand/5 blur-[50px] transition-all duration-500 group-hover:bg-brand/10' />

          <div className='flex items-start gap-4'>
            <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand transition-colors group-hover:bg-brand group-hover:text-brand-foreground'>
              <Building className='size-6' />
            </div>
            <div>
              <h4 className='line-clamp-1 text-base font-bold text-foreground transition-colors group-hover:text-brand'>
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
              className='inline-flex items-center gap-1 text-sm font-semibold text-brand transition-colors hover:text-brand/85'
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
        className='group border-default-200/50 flex h-full min-h-[160px] flex-col items-center justify-center rounded-2xl border border-dashed bg-background/10 p-6 text-center backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-brand/50 hover:bg-background/30'
        href={'/select-organization' as Route}
      >
        <div className='border-default-200/60 flex h-10 w-10 items-center justify-center rounded-full border border-dashed text-muted-foreground transition-all duration-500 group-hover:border-brand/50 group-hover:bg-brand/10 group-hover:text-brand'>
          <Plus className='size-5 transition-transform duration-500 group-hover:rotate-90' />
        </div>
        <span className='mt-4 text-sm font-bold text-foreground transition-colors group-hover:text-brand'>
          Join or Create Workspace
        </span>
        <p className='mt-1 text-xs text-muted-foreground'>Set up a new organization or enter workspace invite codes.</p>
      </Link>
    </div>
  );
}
