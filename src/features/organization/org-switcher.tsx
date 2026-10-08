'use client';

import type { Route } from 'next';
import { usePathname, useRouter } from 'next/navigation';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Skeleton
} from '@courseroad/kurume-ui';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@courseroad/kurume-ui/dashboard';
import { Building2, ChevronsUpDown, Plus, Settings } from 'lucide-react';

import { authClient } from '@/lib/auth/auth-client';
import { extractOrgSlug, getActiveRoleFromPath } from '@/lib/routes/org';

type OrgListItem = {
  id: string;
  logo: string | null;
  name: string;
  slug: string;
};

/**
 * Organization switcher for the dashboard sidebar header.
 *
 * Uses Better Auth's `useListOrganizations` to fetch all orgs
 * the current user belongs to and highlights the URL organization.
 * Switching explicitly updates Better Auth before navigation.
 */
export function OrgSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const { isMobile } = useSidebar();

  const currentSlug = extractOrgSlug(pathname);
  const { data: orgs, isPending: isLoadingOrgs } = authClient.useListOrganizations();

  const orgList: OrgListItem[] = (orgs ?? []).map(org => ({
    id: org.id,
    logo: org.logo ?? null,
    name: org.name,
    slug: org.slug
  }));

  const activeOrg = orgList.find(org => org.slug === currentSlug) ?? orgList[0];
  const activeRole = getActiveRoleFromPath(pathname) ?? 'learner';

  async function handleOrgSwitch(org: OrgListItem) {
    if (org.slug === currentSlug) return;
    const result = await authClient.organization.setActive({ organizationId: org.id });
    if (result.error) return;
    router.push(`/organization/${org.slug}` as Route);
  }

  if (isLoadingOrgs) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size='lg'>
            <Skeleton className='size-8 rounded-lg' />
            <div className='grid flex-1 gap-1'>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-3 w-16' />
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
              size='lg'
            >
              <div className='flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10'>
                {activeOrg?.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className='size-5 rounded object-cover' alt={activeOrg.name} src={activeOrg.logo} />
                ) : (
                  <Building2 className='size-4 text-primary' />
                )}
              </div>
              <div className='grid flex-1 text-left text-sm leading-tight'>
                <span className='truncate font-semibold'>{activeOrg?.name ?? 'No Organization'}</span>
                {activeOrg && <span className='truncate text-xs text-muted-foreground'>{activeOrg.slug}</span>}
              </div>
              <ChevronsUpDown className='ml-auto size-4 text-muted-foreground' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-[--radix-dropdown-menu-trigger-width] min-w-64 rounded-lg'
            align='start'
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={4}
          >
            <DropdownMenuLabel className='text-xs text-muted-foreground'>Organizations</DropdownMenuLabel>

            {orgList.map(org => (
              <DropdownMenuItem key={org.id} className='gap-3 p-2' onClick={() => handleOrgSwitch(org)}>
                <div className='flex size-8 shrink-0 items-center justify-center rounded-md border bg-muted/50'>
                  {org.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className='size-5 rounded object-cover' alt={org.name} src={org.logo} />
                  ) : (
                    <Building2 className='size-4 text-muted-foreground' />
                  )}
                </div>
                <div className='grid flex-1 text-sm leading-tight'>
                  <span className='truncate font-medium'>{org.name}</span>
                  <span className='truncate text-xs text-muted-foreground'>{org.slug}</span>
                </div>
                {org.slug === currentSlug && <div className='size-2 rounded-full bg-primary' />}
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {activeOrg && (activeRole === 'owner' || activeRole === 'manager') && (
                <DropdownMenuItem
                  className='gap-3 p-2'
                  onClick={() => router.push(`/organization/${activeOrg.slug}/settings` as Route)}
                >
                  <Settings className='size-4 text-muted-foreground' />
                  Organization Settings
                </DropdownMenuItem>
              )}
              <DropdownMenuItem className='gap-3 p-2' onClick={() => router.push('/create-organization' as Route)}>
                <Plus className='size-4 text-muted-foreground' />
                Create Organization
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
