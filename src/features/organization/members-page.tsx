'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';

import { Clock, Loader2, MoreVertical, Shield, Trash2, Users, UserX } from 'lucide-react';

import { authClient } from '@/lib/auth/auth-client';

import { Avatar as AccountAvatar, showToast } from '@courseroad/iota-ui';
import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@courseroad/kurume-ui';

import { InviteMemberForm } from './invite-member-form';

type MemberItem = {
  createdAt: string;
  email: string;
  id: string;
  image: string | null;
  name: string;
  role: string;
  userId: string;
};

type InvitationItem = {
  email: string;
  expiresAt: string;
  id: string;
  role: string | null;
  status: string;
};

type MembersPageProps = {
  currentUserId: string;
  initialInvitations: InvitationItem[];
  initialMembers: MemberItem[];
  organizationId: string;
  userRole: string;
};

const roleBadgeVariant: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  creator: 'secondary',
  instructor: 'secondary',
  learner: 'outline',
  manager: 'default',
  owner: 'destructive'
};

/**
 * Full member management page with member table, role editing,
 * invite form, and pending invitations list.
 */
export function MembersPage({
  currentUserId,
  initialInvitations,
  initialMembers,
  organizationId,
  userRole
}: MembersPageProps) {
  const [members, setMembers] = useState<MemberItem[]>(initialMembers);
  const [invitations, setInvitations] = useState<InvitationItem[]>(initialInvitations);
  const [isPending, startTransition] = useTransition();

  const isOwnerOrManager = userRole === 'owner' || userRole === 'manager';

  const refreshMembers = useCallback(() => {
    startTransition(async () => {
      const result = await authClient.organization.getFullOrganization({
        query: { organizationId }
      });

      if (result.data) {
        const mapped: MemberItem[] = (result.data.members ?? []).map((m: Record<string, unknown>) => ({
          createdAt: String(m.createdAt ?? ''),
          email: String((m.user as Record<string, unknown>)?.email ?? ''),
          id: String(m.id),
          image: ((m.user as Record<string, unknown>)?.image as string) ?? null,
          name: String((m.user as Record<string, unknown>)?.name ?? ''),
          role: String(m.role ?? 'member'),
          userId: String(m.userId)
        }));
        setMembers(mapped);

        const invs: InvitationItem[] = (result.data.invitations ?? []).map((inv: Record<string, unknown>) => ({
          email: String(inv.email ?? ''),
          expiresAt: String(inv.expiresAt ?? ''),
          id: String(inv.id),
          role: inv.role ? String(inv.role) : null,
          status: String(inv.status ?? 'pending')
        }));
        setInvitations(invs);
      }
    });
  }, [organizationId, startTransition]);

  useEffect(() => {
    refreshMembers();
  }, [refreshMembers]);

  async function handleRemoveMember(memberId: string) {
    const result = await authClient.organization.removeMember({
      memberIdOrEmail: memberId,
      organizationId
    });

    if (result.error) {
      showToast({
        description: result.error.message ?? 'Failed to remove member.',
        scheme: 'danger',
        title: 'Error'
      });
      return;
    }

    showToast({ description: 'Member removed.', scheme: 'success', title: 'Success' });
    refreshMembers();
  }

  async function handleRoleChange(memberId: string, newRole: string) {
    const result = await authClient.organization.updateMemberRole({
      memberId,
      organizationId,
      role: newRole
    });

    if (result.error) {
      showToast({
        description: result.error.message ?? 'Failed to update role.',
        scheme: 'danger',
        title: 'Error'
      });
      return;
    }

    showToast({ description: 'Role updated.', scheme: 'success', title: 'Success' });
    refreshMembers();
  }

  async function handleCancelInvitation(invitationId: string) {
    const result = await authClient.organization.cancelInvitation({
      invitationId
    });

    if (result.error) {
      showToast({
        description: result.error.message ?? 'Failed to cancel invitation.',
        scheme: 'danger',
        title: 'Error'
      });
      return;
    }

    showToast({ description: 'Invitation cancelled.', scheme: 'success', title: 'Success' });
    refreshMembers();
  }

  const pendingInvitations = invitations.filter(inv => inv.status === 'pending');

  return (
    <div className='space-y-8'>
      {/* Invite form (manager/owner only) */}
      {isOwnerOrManager && <InviteMemberForm organizationId={organizationId} onInviteSent={refreshMembers} />}

      {/* Members table */}
      <div className='space-y-4'>
        <div className='flex items-center gap-2'>
          <Users className='size-5 text-primary' />
          <h3 className='text-lg font-semibold'>Members</h3>
          <Badge variant='secondary'>{members.length}</Badge>
        </div>
        <div className='rounded-xl border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                {isOwnerOrManager && <TableHead className='w-12' />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map(member => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className='flex items-center gap-3'>
                      <AccountAvatar
                        className='size-8 rounded-full'
                        name={member.name}
                        email={member.email}
                        image={member.image}
                        size={32}
                      />
                      <div>
                        <p className='font-medium'>{member.name || member.email.split('@')[0]}</p>
                        <p className='text-xs text-muted-foreground'>{member.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {isOwnerOrManager && member.userId !== currentUserId && member.role !== 'owner' ? (
                      <Select value={member.role} onValueChange={v => handleRoleChange(member.id, v)}>
                        <SelectTrigger className='w-28' size='sm'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='manager'>Manager</SelectItem>
                          <SelectItem value='creator'>Creator</SelectItem>
                          <SelectItem value='instructor'>Instructor</SelectItem>
                          <SelectItem value='learner'>Learner</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant={roleBadgeVariant[member.role] ?? 'outline'}>{member.role}</Badge>
                    )}
                  </TableCell>
                  <TableCell className='text-sm text-muted-foreground'>
                    {member.createdAt
                      ? new Date(member.createdAt).toLocaleDateString('en-US', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })
                      : 'Unknown'}
                  </TableCell>
                  {isOwnerOrManager && (
                    <TableCell>
                      {member.userId !== currentUserId && member.role !== 'owner' && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size='sm' variant='ghost'>
                              <MoreVertical className='size-4' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end'>
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant='destructive' onClick={() => handleRemoveMember(member.id)}>
                              <UserX className='mr-2 size-4' />
                              Remove Member
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {members.length === 0 && (
                <TableRow>
                  <TableCell className='py-8 text-center text-muted-foreground' colSpan={4}>
                    No members found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pending invitations */}
      {isOwnerOrManager && pendingInvitations.length > 0 && (
        <div className='space-y-4'>
          <Separator />
          <div className='flex items-center gap-2'>
            <Clock className='size-5 text-amber-500' />
            <h3 className='text-lg font-semibold'>Pending Invitations</h3>
            <Badge variant='secondary'>{pendingInvitations.length}</Badge>
          </div>
          <div className='space-y-2'>
            {pendingInvitations.map(inv => (
              <div key={inv.id} className='flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3'>
                <div className='flex items-center gap-3'>
                  <Shield className='size-4 text-muted-foreground' />
                  <div>
                    <p className='text-sm font-medium'>{inv.email}</p>
                    <p className='text-xs text-muted-foreground'>
                      Role: {inv.role ?? 'member'} | Expires:{' '}
                      {new Date(inv.expiresAt).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <Button disabled={isPending} size='sm' variant='ghost' onClick={() => handleCancelInvitation(inv.id)}>
                  {isPending ? (
                    <Loader2 className='size-4 animate-spin' />
                  ) : (
                    <Trash2 className='size-4 text-destructive' />
                  )}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
