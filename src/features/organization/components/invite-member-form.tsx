'use client';

import { useState, useTransition } from 'react';

import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  showToast
} from '@courseroad/kurume-ui';

import { Loader2, Mail, UserPlus } from 'lucide-react';

import { authClient } from '@/lib/auth/auth-client';
import {
  assignableOrganizationRoles,
  canAssignOrganizationRole,
  type OrganizationMemberRole,
  organizationRoleLabels
} from '@/lib/auth/org-role-policy';
import { normalizeEmail, validateEmailField } from '@/lib/utils/email-validation';

type InviteMemberFormProps = {
  actorRole: string;
  organizationId: string;
  onInvitationsChanged?: () => void;
};

/**
 * Form for inviting new members to an organization via email.
 * Uses Better Auth's `inviteMember` API.
 */
export function InviteMemberForm({ actorRole, onInvitationsChanged, organizationId }: InviteMemberFormProps) {
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<OrganizationMemberRole>('learner');
  const [error, setError] = useState<string | null>(null);
  const roleOptions = assignableOrganizationRoles(actorRole);
  const selectedRole = canAssignOrganizationRole(actorRole, role) ? role : 'learner';

  function handleSubmit() {
    if (isPending || !email.trim() || !canAssignOrganizationRole(actorRole, selectedRole)) return;
    const normalizedEmail = normalizeEmail(email);
    const validation = validateEmailField(normalizedEmail);
    if (!validation.success) {
      setError(validation.error ?? 'Enter a valid email address.');
      return;
    }
    setError(null);

    startTransition(async () => {
      try {
        const result = await authClient.organization.inviteMember({
          email: normalizedEmail,
          organizationId,
          role: selectedRole
        });

        if (result.error) {
          setError(result.error.message ?? 'Failed to send invitation.');
          showToast({
            description: result.error.message ?? 'Failed to send invitation.',
            scheme: 'danger',
            title: 'Invitation failed'
          });
          return;
        }

        showToast({
          description: `Invitation email submitted for ${normalizedEmail}.`,
          scheme: 'success',
          title: 'Invitation sent'
        });

        setEmail('');
        setRole('learner');
      } catch {
        setError('The invitation request failed. Refresh the invitations below before retrying.');
      } finally {
        // A failed email submission can still leave a recoverable invitation record.
        onInvitationsChanged?.();
      }
    });
  }

  if (roleOptions.length === 0) return null;

  return (
    <div className='rounded-xl border bg-muted/30 p-4'>
      <div className='mb-3 flex items-center gap-2'>
        <UserPlus className='size-5 text-brand' />
        <h4 className='font-semibold'>Invite Member</h4>
      </div>
      {error && (
        <p className='mt-3 text-sm text-destructive' role='alert'>
          {error} If an invitation appears below, use Resend to retry.
        </p>
      )}
      <div className='flex flex-col gap-3 sm:flex-row sm:items-end'>
        <div className='flex-1 space-y-2'>
          <Label htmlFor='invite-email'>Email Address</Label>
          <div className='relative'>
            <Mail className='absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              className='pl-9'
              id='invite-email'
              type='email'
              placeholder='colleague@example.com'
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleSubmit();
              }}
            />
          </div>
        </div>
        <div className='w-36 space-y-2'>
          <Label htmlFor='invite-role'>Role</Label>
          <Select
            items={roleOptions.map(role => ({ value: role, label: organizationRoleLabels[role] }))}
            value={selectedRole}
            onValueChange={v => {
              if (v !== null && canAssignOrganizationRole(actorRole, v)) setRole(v);
            }}
          >
            <SelectTrigger id='invite-role'>
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
        </div>
        <Button disabled={isPending || !email.trim()} onClick={handleSubmit}>
          {isPending ? <Loader2 className='mr-2 size-4 animate-spin' /> : <UserPlus className='mr-2 size-4' />}
          Invite
        </Button>
      </div>
    </div>
  );
}
