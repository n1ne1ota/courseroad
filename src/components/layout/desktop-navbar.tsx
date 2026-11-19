'use client';

import type { ComponentProps } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenu, NavbarMenuItem } from '@courseroad/iota-ui';

import { useNavUser } from '@/hooks/use-nav-user';
import { useSpringInertia } from '@/hooks/use-spring-inertia';
import { navLinks } from '@/lib/config/data';
import { routes } from '@/lib/routes';
import { cn } from '@/lib/utils/cn';
import { isNavLinkActive } from '@/lib/utils/nav-links';

import { CourseroadIcon } from '@/assets/icons/courseroad-icon';
import { AuthButton } from '@/features/auth/components/auth-button';

/**
 * Floating navigation pill for medium screens and up, with scroll-based spring inertia.
 * Hidden below the `md` breakpoint, where `MobileNavbar` takes over.
 *
 * @param props - Props forwarded to the Iota `Navbar` header element
 */
export function DesktopNavbar({ className, ...props }: ComponentProps<typeof Navbar>) {
  const { isPending, user } = useNavUser();
  const pathname = usePathname();

  // Ultra floaty spring physics powered by custom engine
  const wrapperRef = useSpringInertia({
    damping: 15,
    mass: 1.5,
    stiffness: 60
  });

  return (
    <div className='pointer-events-none sticky top-4 z-50 hidden md:block'>
      <div ref={wrapperRef}>
        <Navbar {...props} className={className}>
          <NavbarContent aria-label='Main'>
            <NavbarBrand>
              <Link className='flex items-center transition-opacity hover:opacity-80' href={routes.home}>
                <div className='rounded-full text-background'>
                  <CourseroadIcon size={34} />
                </div>
                <span className='ml-2 font-medium'>Courseroad</span>
              </Link>
            </NavbarBrand>

            <NavbarMenu>
              {navLinks.map(item => {
                const isActive = isNavLinkActive(pathname, item.url);

                return (
                  <NavbarMenuItem key={item.url}>
                    <Link
                      className={cn(
                        'text-sm transition-colors hover:text-foreground',
                        isActive ? 'text-foreground' : 'text-muted-foreground'
                      )}
                      href={item.url}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {item.name}
                    </Link>
                  </NavbarMenuItem>
                );
              })}
            </NavbarMenu>

            <NavbarItem className='ml-2' role='group' aria-label='Account'>
              <AuthButton isPending={isPending} user={user} variant='desktop' />
            </NavbarItem>
          </NavbarContent>
        </Navbar>
      </div>
    </div>
  );
}
