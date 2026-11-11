'use client';

import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Button, Spinner } from '@courseroad/iota-ui';
import { Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

import { useSession } from '@/lib/auth/auth-client';
import { headerData } from '@/lib/config/data';
import { routes } from '@/lib/routes';
import { transformSessionUser } from '@/lib/utils/auth-helpers';

import { CourseroadIcon } from '@/assets/icons/courseroad-icon';
import { AccountDropdown } from '@/features/auth/components/account-dropdown';
import { AuthButton } from '@/features/auth/components/auth-button';

/**
 * Mobile navigation header with collapsible menu
 * Provides responsive navigation and authentication controls for small screens
 */
export function MobileHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session, isPending } = useSession();
  const pathname = usePathname();

  // Avoid hydration mismatch for user-dependent UI
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // Transform session user data for consistent usage
  const user = useMemo(() => (session ? transformSessionUser(session) : null), [session]);

  // Close menu when navigation completes (pathname changes)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMenuOpen(false);
  }, [pathname]);

  // Handle menu item clicks for immediate closing
  const handleMenuItemClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className='border-default-200/50 sticky top-0 z-50 flex w-full items-center justify-between border-b bg-background/70 px-4 py-3 backdrop-blur-md backdrop-saturate-150 md:hidden'>
        <div className='flex items-center justify-start'>
          <button
            className='hover:bg-default-100 flex h-10 w-10 items-center justify-center rounded-md transition-colors'
            type='button'
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <div className='flex grow justify-center'>
          <CourseroadIcon size={32} />
        </div>

        <div className='flex items-center justify-end'>
          <motion.div
            animate={{
              opacity: isMenuOpen ? 0 : 1,
              pointerEvents: isMenuOpen ? 'none' : 'auto'
            }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {!mounted || isPending ? (
              <Button
                disabled
                isLoading
                color='secondary'
                radius='full'
                size='sm'
                spinner={<Spinner color='current' size='sm' />}
                variant='solid'
              >
                Sign In
              </Button>
            ) : user ? (
              <AccountDropdown user={user} />
            ) : (
              <Button as={Link} color='secondary' href={routes.signIn} radius='full' size='sm' variant='solid'>
                Sign In
              </Button>
            )}
          </motion.div>
        </div>
      </header>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className='border-default-200/50 fixed inset-x-0 top-[65px] z-40 flex h-[calc(100vh-65px)] flex-col overflow-y-auto border-b bg-background/95 px-6 pt-6 pb-8 shadow-lg backdrop-blur-md md:hidden'
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            initial={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <nav className='flex w-full flex-col gap-6'>
              {headerData.map((item, index) => (
                <div key={`mobile-${item.name}-${index}`} className='flex w-full flex-col'>
                  <Link
                    className='text-large w-full font-medium text-muted-foreground transition-colors hover:text-foreground'
                    href={item.url}
                    onClick={handleMenuItemClick}
                  >
                    {item.name}
                  </Link>
                  {index < headerData.length - 1 && <hr className='mt-6 border-t border-border' />}
                </div>
              ))}

              {(!mounted || !user) && (
                <div className='mt-4 flex w-full flex-row gap-3 border-t border-border pt-6'>
                  <AuthButton isPending={!mounted || isPending} user={user} variant='mobile' />
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
