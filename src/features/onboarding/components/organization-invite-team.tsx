'use client';

import { useState } from 'react';

import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger } from '@courseroad/iota-ui';

import { Plus, Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

import { isOrganizationMemberRole, organizationMemberRoles, organizationRoleLabels } from '@/lib/auth/org-role-policy';

import { inviteRowsSchema, MAX_TEAM_INVITES, type OrganizationInviteRow } from '@/features/onboarding/schemas/schemas';

const descriptions = {
  manager: 'Manage the team and organization operations.',
  creator: 'Create and manage organization courses.',
  instructor: 'Teach and support organization learners.',
  learner: 'Take courses and track learning progress.'
};

/** Optional team invitations with stable row identity and non-owner membership roles. */
export function InviteTeam({
  rows,
  onRowsChange,
  showErrors = false
}: {
  rows: OrganizationInviteRow[];
  onRowsChange: (rows: OrganizationInviteRow[]) => void;
  showErrors?: boolean;
}) {
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const validation = inviteRowsSchema.safeParse(rows);
  function errorFor(index: number, field: string) {
    if (!showErrors && !touched[rows[index]?.id ?? '']) return undefined;
    return validation.error?.issues.find(issue => issue.path[0] === index && issue.path[1] === field)?.message;
  }
  function update(id: string, values: Partial<Pick<OrganizationInviteRow, 'email' | 'role'>>) {
    onRowsChange(rows.map(row => (row.id === id ? { ...row, ...values } : row)));
  }

  return (
    <div className='flex flex-col gap-3'>
      <AnimatePresence initial={false}>
        {rows.length === 0 && (
          <p key='empty' className='rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground'>
            No team members added yet. You can invite them later from Members.
          </p>
        )}
        {rows.map((row, index) => (
          <motion.div
            key={row.id}
            className='flex flex-col gap-2 rounded-xl border p-3'
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
          >
            <div className='flex items-center gap-2'>
              <Input
                className='flex-1'
                type='email'
                label={`Team member email ${index + 1}`}
                value={row.email}
                aria-label={`Team member email ${index + 1}`}
                onBlur={() => setTouched(previous => ({ ...previous, [row.id]: true }))}
                onChange={event => update(row.id, { email: event.target.value })}
              />
              <Button
                isIconOnly
                color='destructive'
                size='sm'
                variant='ghost'
                aria-label={`Remove team member ${index + 1}`}
                onPress={() => onRowsChange(rows.filter(existing => existing.id !== row.id))}
              >
                <Trash2 className='size-4' />
              </Button>
            </div>
            {errorFor(index, 'email') && (
              <p className='text-xs text-destructive' role='alert'>
                {errorFor(index, 'email')}
              </p>
            )}
            <Select
              label={`Team member role ${index + 1}`}
              value={row.role}
              onValueChange={role => {
                if (isOrganizationMemberRole(role)) update(row.id, { role });
              }}
            >
              <SelectTrigger aria-label={`Team member role ${index + 1}`} />
              <SelectContent>
                {organizationMemberRoles.map(role => (
                  <SelectItem key={role} value={role}>
                    {organizationRoleLabels[role]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errorFor(index, 'role') && (
              <p className='text-xs text-destructive' role='alert'>
                {errorFor(index, 'role')}
              </p>
            )}
            <p className='text-xs text-muted-foreground'>{descriptions[row.role]}</p>
          </motion.div>
        ))}
      </AnimatePresence>
      <Button
        disabled={rows.length >= MAX_TEAM_INVITES}
        size='sm'
        startContent={<Plus className='size-4' />}
        variant='secondary'
        onPress={() => {
          if (rows.length < MAX_TEAM_INVITES)
            onRowsChange([...rows, { id: crypto.randomUUID(), email: '', role: 'learner' }]);
        }}
      >
        Add Team Member
      </Button>
      <p className='text-center text-xs text-muted-foreground'>
        {rows.length}/{MAX_TEAM_INVITES} invitations
      </p>
    </div>
  );
}
