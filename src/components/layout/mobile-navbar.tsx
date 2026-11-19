'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Button, Spinner } from '@courseroad/iota-ui';

import { Dialog } from '@base-ui/react/dialog';
import { CloseCircleLinearIcon as CloseIcon, HamburgerMenuLinearIcon as MenuIcon } from '@solar-icons/react';

import { useNavUser } from '@/hooks/use-nav-user';
import { navLinks } from '@/lib/config/data';
import { routes } from '@/lib/routes';
import { cn } from '@/lib/utils/cn';
import { isNavLinkActive } from '@/lib/utils/nav-links';

import { CourseroadIcon } from '@/assets/icons/courseroad-icon';
import { AccountDropdown } from '@/features/auth/components/account-dropdown';
import { AuthButton } from '@/features/auth/components/auth-button';

const iconButtonClassName =
  'flex size-10 items-center justify-center rounded-md text-foreground transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none';

/**
 * Navigation bar for small screens: a sticky top bar whose menu button opens a full-screen modal dialog.
 * Base UI's Dialog supplies the focus trap, Escape to close, scroll lock, and trigger ARIA, so none of it is
 * hand-rolled here. Hidden from the `md` breakpoint up, where `DesktopNavbar` takes over.
 */
export function MobileNavbar() {
  const { isPending, user } = useNavUser();
  const pathname = usePathname();

  // The menu is open only for the page it was opened on, so navigating anywhere closes it without an effect.
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const isOpen = openedOn !== null && openedOn === pathname;
  const closeMenu = () => setOpenedOn(null);

  // Resizing to a desktop width while open would leave an invisible modal holding focus and the scroll lock.
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 768px)');
    const closeOnDesktop = () => {
      if (desktop.matches) setOpenedOn(null);
    };

    desktop.addEventListener('change', closeOnDesktop);

    return () => desktop.removeEventListener('change', closeOnDesktop);
  }, []);

  return (
    <Dialog.Root open={isOpen} onOpenChange={open => setOpenedOn(open ? pathname : null)}>
      <header className='sticky top-0 z-40 flex w-full items-center justify-between border-b border-border bg-background/70 px-4 py-3 backdrop-blur-md backdrop-saturate-150 md:hidden'>
        <Dialog.Trigger className={iconButtonClassName} aria-label='Open menu'>
          <MenuIcon height={24} width={24} aria-hidden='true' />
        </Dialog.Trigger>

        <Link className='flex grow justify-center' href={routes.home} aria-label='Courseroad home'>
          <CourseroadIcon size={32} />
        </Link>

        <div className='flex items-center justify-end'>
          {isPending ? (
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
          ) : user ? (
            <AccountDropdown user={user} />
          ) : (
            <Button as={Link} href={routes.signIn} radius='full' size='sm' variant='secondary'>
              Sign In
            </Button>
          )}
        </div>
      </header>

      <Dialog.Portal>
        <Dialog.Popup
          className='fixed inset-0 z-50 flex flex-col overflow-y-auto bg-background px-6 pb-8 transition-opacity duration-200 outline-none data-ending-style:opacity-0 data-starting-style:opacity-0 md:hidden'
          data-lenis-prevent=''
        >
          <div className='flex items-center justify-between py-3'>
            <Dialog.Close className={iconButtonClassName} aria-label='Close menu'>
              <CloseIcon height={24} width={24} aria-hidden='true' />
            </Dialog.Close>
            <CourseroadIcon size={32} />
            <div className='size-10' aria-hidden='true' />
          </div>

          <Dialog.Title className='sr-only'>Menu</Dialog.Title>

          <nav className='mt-4 flex flex-col' aria-label='Main'>
            <ul className='flex flex-col'>
              {navLinks.map(item => {
                const isActive = isNavLinkActive(pathname, item.url);

                return (
                  <li key={item.url} className='border-b border-border last:border-b-0'>
                    <Link
                      className={cn(
                        'block py-5 text-lg font-medium transition-colors hover:text-foreground',
                        isActive ? 'text-foreground' : 'text-muted-foreground'
                      )}
                      href={item.url}
                      aria-current={isActive ? 'page' : undefined}
                      onClick={closeMenu}
                    >
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {!user && (
            <div className='mt-4 flex w-full flex-row gap-3 border-t border-border pt-6'>
              <AuthButton isPending={isPending} user={user} variant='mobile' />
            </div>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
