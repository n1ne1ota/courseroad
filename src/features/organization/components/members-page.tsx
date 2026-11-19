'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';

import { Avatar as AccountAvatar } from '@courseroad/iota-ui';
import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
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
  showToast,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@courseroad/kurume-ui';

import { Clock, Loader2, MoreVertical, RefreshCw, Shield, Trash2, Users, UserX } from 'lucide-react';

import { authClient } from '@/lib/auth/auth-client';
import {
  assignableOrganizationRoles,
  canAssignOrganizationRole,
  canManageOrganizationMember,
  isOrganizationMemberRole,
  organizationRoleLabels
} from '@/lib/auth/org-role-policy';

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

const roleBadge: Record<string, { color?: 'destructive'; variant?: 'outline' | 'primary' | 'secondary' }> = {
  creator: { variant: 'secondary' },
  instructor: { variant: 'secondary' },
  learner: { variant: 'outline' },
  manager: { variant: 'primary' },
  owner: { color: 'destructive' }
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
  const [actorRole, setActorRole] = useState(userRole);
  const [isRefreshing, startTransition] = useTransition();
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [invitationActions, setInvitationActions] = useState<Record<string, 'resend' | 'cancel'>>({});
  const [invitationErrors, setInvitationErrors] = useState<Record<string, string>>({});
  const invitationLocks = useRef(new Set<string>());
  const [now, setNow] = useState(() => Date.now());

  const isOwnerOrManager = actorRole === 'owner' || actorRole === 'manager';
  const roleOptions = assignableOrganizationRoles(actorRole);
  const canManageMember = (member: MemberItem) =>
    canManageOrganizationMember({ userId: currentUserId, role: actorRole }, member);

  const refreshMembers = useCallback(() => {
    startTransition(async () => {
      try {
        const result = await authClient.organization.getFullOrganization({
          query: { organizationId }
        });
        if (result.error) {
          setRefreshError(result.error.message ?? 'Could not refresh members and invitations.');
          return;
        }

        if (result.data) {
          setRefreshError(null);
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
          setActorRole(mapped.find(member => member.userId === currentUserId)?.role ?? '');

          const invs: InvitationItem[] = (result.data.invitations ?? []).map((inv: Record<string, unknown>) => ({
            email: String(inv.email ?? ''),
            expiresAt: String(inv.expiresAt ?? ''),
            id: String(inv.id),
            role: inv.role ? String(inv.role) : null,
            status: String(inv.status ?? 'pending')
          }));
          setInvitations(invs);
        }
      } catch {
        setRefreshError('Could not refresh members and invitations. Try again.');
      }
    });
  }, [currentUserId, organizationId, startTransition]);

  useEffect(() => {
    refreshMembers();
  }, [refreshMembers]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(interval);
  }, []);

  async function handleRemoveMember(memberId: string) {
    const member = members.find(item => item.id === memberId);
    if (!member || !canManageMember(member)) return;
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
    const member = members.find(item => item.id === memberId);
    if (!member || !canManageMember(member) || !canAssignOrganizationRole(actorRole, newRole)) return;
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

  async function handleInvitationAction(invitationId: string, action: 'resend' | 'cancel') {
    const invitation = invitations.find(item => item.id === invitationId);
    if (
      !invitation ||
      !canAssignOrganizationRole(actorRole, invitation.role) ||
      invitationLocks.current.has(invitationId)
    )
      return;
    invitationLocks.current.add(invitationId);
    setInvitationActions(current => ({ ...current, [invitationId]: action }));
    setInvitationErrors(current => ({ ...current, [invitationId]: '' }));
    try {
      const result =
        action === 'cancel'
          ? await authClient.organization.cancelInvitation({ invitationId })
          : await authClient.organization.inviteMember({
              email: invitation.email,
              organizationId,
              role: invitation.role,
              // Native resend renews active invitations; expired ones need a new ID.
              resend: invitation.status === 'pending' && new Date(invitation.expiresAt).getTime() > now
            });
      if (result.error) {
        setInvitationErrors(current => ({
          ...current,
          [invitationId]: result.error.message ?? 'The invitation could not be updated.'
        }));
        return;
      }
      showToast({
        description: action === 'cancel' ? 'Invitation cancelled.' : 'Invitation email submitted.',
        scheme: 'success',
        title: 'Success'
      });
    } catch {
      setInvitationErrors(current => ({ ...current, [invitationId]: 'The request failed. Refresh and try again.' }));
    } finally {
      invitationLocks.current.delete(invitationId);
      setInvitationActions(current => {
        const next = { ...current };
        delete next[invitationId];
        return next;
      });
      refreshMembers();
    }
  }

  const pendingInvitations = invitations.filter(inv => inv.status === 'pending' || inv.status === 'expired');

  return (
    <div className='space-y-8'>
      {refreshError && (
        <div className='flex items-center gap-3'>
          <p className='text-sm text-destructive' role='alert'>
            {refreshError}
          </p>
          <Button disabled={isRefreshing} size='sm' variant='ghost' onClick={refreshMembers}>
            Refresh
          </Button>
        </div>
      )}
      {/* Invite form (manager/owner only) */}
      {isOwnerOrManager && (
        <InviteMemberForm actorRole={actorRole} organizationId={organizationId} onInvitationsChanged={refreshMembers} />
      )}

      {/* Members table */}
      <div className='space-y-4'>
        <div className='flex items-center gap-2'>
          <Users className='size-5 text-brand' />
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
                    {canManageMember(member) ? (
                      <Select
                        items={roleOptions.map(role => ({ value: role, label: organizationRoleLabels[role] }))}
                        value={member.role}
                        onValueChange={v => {
                          if (v !== null) handleRoleChange(member.id, v);
                        }}
                      >
                        <SelectTrigger className='w-28' size='sm' aria-label={`Role for ${member.email}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {roleOptions.map(option => (
                            <SelectItem key={option} value={option}>
                              {organizationRoleLabels[option]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge {...(roleBadge[member.role] ?? { variant: 'outline' })}>{member.role}</Badge>
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
                      {canManageMember(member) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={<Button size='sm' variant='ghost' aria-label={`Actions for ${member.email}`} />}
                          >
                            <MoreVertical className='size-4' />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent positionerProps={{ align: 'end' }}>
                            <DropdownMenuGroup>
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem variant='destructive' onClick={() => handleRemoveMember(member.id)}>
                                <UserX className='mr-2 size-4' />
                                Remove Member
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
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
          <Separator role='presentation' />
          <div className='flex items-center gap-2'>
            <Clock className='size-5 text-warning' />
            <h3 className='text-lg font-semibold'>Invitations</h3>
            <Badge variant='secondary'>{pendingInvitations.length}</Badge>
          </div>
          <div className='space-y-2'>
            {pendingInvitations.map(inv => {
              const expiresAt = new Date(inv.expiresAt);
              const expired =
                inv.status === 'expired' || !Number.isFinite(expiresAt.getTime()) || expiresAt.getTime() <= now;
              const action = invitationActions[inv.id];
              return (
                <div key={inv.id} className='flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3'>
                  <div className='flex items-center gap-3'>
                    <Shield className='size-4 text-muted-foreground' />
                    <div>
                      <p className='text-sm font-medium'>{inv.email}</p>
                      <p className='text-xs text-muted-foreground'>
                        Role:{' '}
                        {isOrganizationMemberRole(inv.role)
                          ? organizationRoleLabels[inv.role]
                          : (inv.role ?? 'Unknown')}{' '}
                        | Expires:{' '}
                        {Number.isFinite(expiresAt.getTime())
                          ? expiresAt.toLocaleString('en-US', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit'
                            })
                          : 'Unknown'}
                      </p>
                      <Badge variant={expired ? 'outline' : 'secondary'}>{expired ? 'Expired' : 'Pending'}</Badge>
                      {invitationErrors[inv.id] && (
                        <p className='mt-1 text-sm text-destructive' role='alert'>
                          {invitationErrors[inv.id]}
                        </p>
                      )}
                    </div>
                  </div>
                  {canAssignOrganizationRole(actorRole, inv.role) && (
                    <div className='flex items-center gap-2'>
                      <Button
                        disabled={Boolean(action)}
                        size='sm'
                        variant='ghost'
                        aria-label={`${expired ? 'Invite again' : 'Resend invitation'} to ${inv.email}`}
                        onClick={() => handleInvitationAction(inv.id, 'resend')}
                      >
                        {action === 'resend' ? (
                          <Loader2 className='mr-2 size-4 animate-spin' />
                        ) : (
                          <RefreshCw className='mr-2 size-4' />
                        )}
                        {expired ? 'Invite again' : 'Resend'}
                      </Button>
                      <Button
                        disabled={Boolean(action)}
                        size='sm'
                        variant='ghost'
                        aria-label={`Cancel invitation to ${inv.email}`}
                        onClick={() => handleInvitationAction(inv.id, 'cancel')}
                      >
                        {action === 'cancel' ? (
                          <Loader2 className='size-4 animate-spin' />
                        ) : (
                          <Trash2 className='size-4 text-destructive' />
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
