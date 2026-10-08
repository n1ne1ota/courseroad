'use client';

import type { HTMLAttributes } from 'react';
import { useMemo } from 'react';

import Link from 'next/link';

import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from '@courseroad/iota-ui';

import { useSpringInertia } from '@/hooks/use-spring-inertia';
import { useSession } from '@/lib/auth/auth-client';
import { headerData } from '@/lib/config/data';
import { routes } from '@/lib/routes';
import { transformSessionUser } from '@/lib/utils/auth-helpers';

import { CourseroadIcon } from '@/assets/icons/courseroad-icon';
import { AuthButton } from '@/features/auth/components/auth-button';

/**
 * Desktop navigation header with floating animation
 * Features scroll-based inertia physics and authentication controls
 *
 * @param props - HeroUI Navbar props for customization
 */
export function Header(props: HTMLAttributes<HTMLElement>) {
  const { data: session, isPending } = useSession();

  // Transform session user data for consistent usage
  const user = useMemo(() => (session ? transformSessionUser(session) : null), [session]);

  // Ultra floaty spring physics powered by custom engine
  const wrapperRef = useSpringInertia({
    damping: 15,
    mass: 1.5,
    stiffness: 60
  });

  return (
    <div className='pointer-events-none sticky top-4 z-50'>
      <div ref={wrapperRef}>
        <Navbar {...props} className='hidden md:flex'>
          <NavbarContent>
            {/* Logo */}
            <NavbarBrand>
              <Link className='flex items-center transition-opacity hover:opacity-80' href={routes.home}>
                <div className='rounded-full text-background'>
                  <CourseroadIcon size={34} />
                </div>
                <span className='ml-2 font-medium'>Courseroad</span>
              </Link>
            </NavbarBrand>

            {/* Navigation Items */}
            {headerData.map((item, index) => (
              <NavbarItem key={`desktop-${item.name}-${index}`}>
                <Link className='text-sm text-muted-foreground transition-colors hover:text-foreground' href={item.url}>
                  {item.name}
                </Link>
              </NavbarItem>
            ))}

            <NavbarItem className='ml-2' aria-label='Authentication'>
              <AuthButton isPending={isPending} user={user} variant='desktop' />
            </NavbarItem>
          </NavbarContent>
        </Navbar>
      </div>
    </div>
  );
}
