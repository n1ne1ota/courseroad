'use client';

import type { Route } from 'next';
import { useRouter } from 'next/navigation';

import { UserDropdown } from '@courseroad/iota-ui';

import { signOutUser } from '@/lib/auth/auth-client';
import { routes } from '@/lib/routes';

import type { UserDropdownData } from '@/types/user.types';

interface AuthAccountDropdownProps {
  className?: string;
  user: UserDropdownData;
}

/**
 * Smart User account dropdown menu
 * Binds the Iota UI presentation layer to the Courseroad routing and auth session layer
 */
export function AccountDropdown({ className, user }: AuthAccountDropdownProps) {
  const router = useRouter();

  const handleAction = async (key: string) => {
    switch (key) {
      case 'account':
        router.push(routes.selectOrganization as Route);
        break;
      case 'settings':
        router.push(routes.selectOrganization as Route);
        break;
      case 'help':
        router.push(routes.contact as Route);
        break;
      case 'sign out':
        if ((await signOutUser()).success) {
          router.push('/' as Route);
        }
        break;
      default:
        break;
    }
  };

  return <UserDropdown className={className} user={user} onAction={handleAction} />;
}
