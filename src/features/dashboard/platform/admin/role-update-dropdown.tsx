'use client';

import { useTransition } from 'react';

import { Button, showErrorToast, showSuccessToast } from '@kurume-ui/core';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@kurume-ui/core';
import { Tooltip, TooltipContent, TooltipTrigger } from '@kurume-ui/core';
import { Loader2, MoreVerticalIcon } from 'lucide-react';

import type { UserRole } from '@/lib/utils/auth-navigation';

import { updateUserRole } from '@/features/auth/actions/admin-actions';

interface RoleUpdateDropdownProps {
  currentRole: UserRole | string;
  userId: string;
}

const ROLES: UserRole[] = ['learner', 'creator', 'staff'];

export function RoleUpdateDropdown({ currentRole, userId }: RoleUpdateDropdownProps) {
  const [isPending, startTransition] = useTransition();

  if (currentRole === 'admin') {
    return (
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              disabled
              focusableWhenDisabled
              size='icon-md'
              variant='ghost'
              aria-label='Admin role cannot be modified'
            />
          }
        >
          <MoreVerticalIcon className='text-muted-foreground' size={16} />
        </TooltipTrigger>
        <TooltipContent>
          <p>Admin role cannot be modified</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  const handleRoleChange = (newRole: UserRole) => {
    if (newRole === currentRole) return;

    startTransition(async () => {
      const result = await updateUserRole({ targetRole: newRole, userId });

      if (result.success) {
        showSuccessToast({
          description: 'User role has been updated.',
          title: 'Role Updated'
        });
      } else {
        showErrorToast({
          description: result.error || 'Failed to update user role',
          title: 'Update Failed'
        });
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button disabled={isPending} size='icon-md' variant='ghost' aria-label='Change user role' />}
      >
        {isPending ? (
          <Loader2 className='animate-spin text-muted-foreground' size={16} />
        ) : (
          <MoreVerticalIcon className='text-muted-foreground' size={16} />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent positionerProps={{ align: 'end' }}>
        {ROLES.map(role => (
          <DropdownMenuItem
            key={role}
            className={currentRole === role ? 'font-bold' : ''}
            onClick={() => handleRoleChange(role)}
          >
            Make {role.replace('_', ' ')}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
