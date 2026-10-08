'use client';
import type { Route } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button, Card } from '@courseroad/iota-ui';
import { ArrowRight, Building2, Plus, Users } from 'lucide-react';
import { motion } from 'motion/react';

import { authClient } from '@/lib/auth/auth-client';

interface MembershipItem {
  id: string;
  organization: {
    id: string;
    logo: string | null;
    name: string;
    plan: string;
    slug: string;
  };
  role: string;
}

interface SelectOrganizationListProps {
  memberships: MembershipItem[];
}

export function SelectOrganizationList({ memberships }: SelectOrganizationListProps) {
  const router = useRouter();

  return (
    <motion.div
      className='w-full max-w-md'
      animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
      initial={{ filter: 'blur(4px)', opacity: 0, y: 20 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <Card className='flex w-full flex-col gap-6 overflow-hidden p-8'>
        <div className='text-center'>
          <h1 className='text-2xl font-extrabold tracking-tight'>Select Organization</h1>
          <p className='mt-2 text-sm text-muted-foreground'>Choose which organization you want to work in.</p>
        </div>

        {memberships.length === 0 ? (
          <div className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/10 p-8 text-center backdrop-blur-sm'>
            <div className='mb-3.5 flex size-11 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/70'>
              <Users className='size-5 text-zinc-500' />
            </div>
            <h3 className='text-base font-bold text-zinc-300'>No organizations</h3>
            <p className='mt-1.5 max-w-[240px] text-xs leading-normal text-muted-foreground'>
              You are not a member of any organization. Set up a new organization or ask an admin to invite you.
            </p>
            <Button
              className='mt-5 cursor-pointer'
              color='primary'
              onPress={() => router.push('/create-organization' as Route)}
            >
              <Plus className='mr-1.5 size-4' />
              Create Organization
            </Button>
          </div>
        ) : (
          <div className='flex flex-col gap-3'>
            <div className='flex max-h-[300px] scrollbar-thin flex-col gap-3 overflow-y-auto pr-1'>
              {memberships.map(membership => (
                <Link
                  key={membership.id}
                  className='group flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/10 p-4 transition-all duration-300 hover:border-primary/80 hover:bg-primary/10 hover:shadow-[0_0_15px_-3px_rgba(59,130,246,0.2)]'
                  href={`/organization/${membership.organization.slug}` as Route}
                  onClick={async event => {
                    event.preventDefault();
                    const result = await authClient.organization.setActive({
                      organizationId: membership.organization.id
                    });
                    if (!result.error) router.push(`/organization/${membership.organization.slug}` as Route);
                  }}
                >
                  <div className='flex size-10 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 transition-all duration-300 group-hover:border-primary/20 group-hover:bg-primary/20 group-hover:shadow-inner'>
                    {membership.organization.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        className='size-7 rounded-md object-cover'
                        alt={membership.organization.name}
                        src={membership.organization.logo}
                      />
                    ) : (
                      <Building2 className='size-5 text-zinc-500 transition-colors group-hover:text-primary' />
                    )}
                  </div>

                  <div className='min-w-0 flex-1'>
                    <h3 className='truncate text-sm font-bold text-zinc-300 transition-colors group-hover:text-primary'>
                      {membership.organization.name}
                    </h3>
                    <div className='mt-0.5 flex items-center gap-1.5 text-[10px] text-zinc-500 transition-colors group-hover:text-primary/70'>
                      <span className='capitalize'>{membership.role}</span>
                      <span>&bull;</span>
                      <span className='rounded bg-zinc-800 px-1.5 py-0.5 text-[8px] font-bold tracking-wider uppercase group-hover:bg-primary/20'>
                        {membership.organization.plan}
                      </span>
                    </div>
                  </div>

                  <div className='flex size-8 shrink-0 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 transition-all duration-300 group-hover:border-primary/30 group-hover:bg-primary/20 group-hover:text-primary'>
                    <ArrowRight className='size-4 text-zinc-500 transition-colors group-hover:text-primary' />
                  </div>
                </Link>
              ))}
            </div>

            <div className='mt-2 flex flex-col gap-2 border-t border-zinc-800 pt-4'>
              <Button
                className='w-full cursor-pointer'
                color='secondary'
                onPress={() => router.push('/create-organization' as Route)}
              >
                <Plus className='mr-1.5 size-4' />
                Create New Organization
              </Button>
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
