import { Badge } from '@kurume-ui/core';
import { GraduationCap, HardHat, ShieldAlert, ShieldCheck } from 'lucide-react';

import type { UserRole } from '@/lib/utils/auth-navigation';

export function UserRoleBadge({ role }: { role: UserRole | string }) {
  switch (role) {
    case 'admin':
      return (
        <Badge variant='soft-destructive'>
          <ShieldAlert />
          Admin
        </Badge>
      );
    case 'staff':
      return (
        <Badge variant='soft-primary'>
          <ShieldCheck />
          Staff
        </Badge>
      );
    case 'creator':
      return (
        <Badge variant='soft-success'>
          <HardHat />
          Creator
        </Badge>
      );
    case 'learner':
      return (
        <Badge variant='soft-secondary'>
          <GraduationCap />
          Learner
        </Badge>
      );
    default:
      return <Badge variant='outline'>{role}</Badge>;
  }
}
