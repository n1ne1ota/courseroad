'use client';

import { useState, useTransition } from 'react';

import { Loader2, Mail, UserPlus } from 'lucide-react';

import { authClient } from '@/lib/auth/auth-client';

import { showToast } from '@courseroad/iota-ui';
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@courseroad/kurume-ui';

type OrgRole = 'manager' | 'creator' | 'instructor' | 'learner';

const roleOptions: { label: string; value: OrgRole }[] = [
  { label: 'Learner', value: 'learner' },
  { label: 'Instructor', value: 'instructor' },
  { label: 'Creator', value: 'creator' },
  { label: 'Manager', value: 'manager' }
];

type InviteMemberFormProps = {
  organizationId: string;
  onInviteSent?: () => void;
};

/**
 * Form for inviting new members to an organization via email.
 * Uses Better Auth's `inviteMember` API.
 */
export function InviteMemberForm({ onInviteSent, organizationId }: InviteMemberFormProps) {
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<OrgRole>('learner');

  function handleSubmit() {
    if (!email.trim()) return;

    startTransition(async () => {
      const result = await authClient.organization.inviteMember({
        email: email.trim(),
        organizationId,
        role
      });

      if (result.error) {
        showToast({
          description: result.error.message ?? 'Failed to send invitation.',
          scheme: 'danger',
          title: 'Invitation failed'
        });
        return;
      }

      showToast({
        description: `Invitation sent to ${email}.`,
        scheme: 'success',
        title: 'Invitation sent'
      });

      setEmail('');
      setRole('learner');
      onInviteSent?.();
    });
  }

  return (
    <div className='rounded-xl border bg-muted/30 p-4'>
      <div className='mb-3 flex items-center gap-2'>
        <UserPlus className='size-5 text-primary' />
        <h4 className='font-semibold'>Invite Member</h4>
      </div>
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
          <Select value={role} onValueChange={v => setRole(v as OrgRole)}>
            <SelectTrigger id='invite-role'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {roleOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
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
