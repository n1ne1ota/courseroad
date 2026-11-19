import type { JSX } from 'react';

import {
  Button,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  Spinner
} from '@courseroad/iota-ui';

import { HamburgerMenuLinearIcon as MenuIcon } from '@solar-icons/react';

import { navLinks } from '@/lib/config/data';

import { CourseroadIcon } from '@/assets/icons/courseroad-icon';
import { AuthButton } from '@/features/auth/components/auth-button';

/**
 * Loading counterpart of `SiteNavigation`. Everything here is static, so it renders for real inside the same
 * floating `Navbar` (desktop) and bar (mobile): the brand, the link labels, and the account controls in
 * their own pending state. Nothing is a placeholder, so the navigation does not shift when the session resolves.
 */
export function SiteNavigationSkeleton(): JSX.Element {
  return (
    <>
      <div className='pointer-events-none sticky top-4 z-50 hidden md:block'>
        <Navbar>
          <NavbarContent aria-label='Main'>
            <NavbarBrand>
              <div className='flex items-center'>
                <div className='rounded-full text-background'>
                  <CourseroadIcon size={34} />
                </div>
                <span className='ml-2 font-medium'>Courseroad</span>
              </div>
            </NavbarBrand>

            <NavbarMenu>
              {navLinks.map(item => (
                <NavbarMenuItem key={item.url}>
                  <span className='text-sm text-muted-foreground'>{item.name}</span>
                </NavbarMenuItem>
              ))}
            </NavbarMenu>

            <NavbarItem className='ml-2' role='group' aria-label='Account'>
              <AuthButton isPending user={null} variant='desktop' />
            </NavbarItem>
          </NavbarContent>
        </Navbar>
      </div>

      <header className='sticky top-0 z-40 flex w-full items-center justify-between border-b border-border bg-background/70 px-4 py-3 backdrop-blur-md backdrop-saturate-150 md:hidden'>
        <div className='flex size-10 items-center justify-center'>
          <MenuIcon height={24} width={24} aria-hidden='true' />
        </div>
        <div className='flex grow justify-center'>
          <CourseroadIcon size={32} />
        </div>
        <Button
          disabled
          isLoading
          radius='full'
          size='sm'
          spinner={<Spinner color='current' size='sm' />}
          variant='secondary'
        >
          Sign In
        </Button>
      </header>
    </>
  );
}
