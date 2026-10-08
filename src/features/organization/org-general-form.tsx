'use client';

import { useState, useTransition } from 'react';

import { Building2, Loader2 } from 'lucide-react';

import { authClient } from '@/lib/auth/auth-client';

import { showToast } from '@courseroad/iota-ui';
import { Button, Input, Label } from '@courseroad/kurume-ui';

type OrgGeneralFormProps = {
  orgId: string;
  orgLogo: string | null;
  orgName: string;
  orgSlug: string;
};

/**
 * Form for updating general organization settings (name, logo).
 * Slug is displayed as read-only since changing it would break URLs.
 */
export function OrgGeneralForm({ orgId, orgLogo, orgName, orgSlug }: OrgGeneralFormProps) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(orgName);
  const [logoUrl, setLogoUrl] = useState(orgLogo ?? '');

  function handleSave() {
    if (!name.trim()) return;

    startTransition(async () => {
      const result = await authClient.organization.update({
        data: {
          logo: logoUrl || undefined,
          name: name.trim()
        },
        organizationId: orgId
      });

      if (result.error) {
        showToast({
          description: result.error.message ?? 'Failed to update organization.',
          scheme: 'danger',
          title: 'Update failed'
        });
        return;
      }

      showToast({
        description: 'Organization settings have been saved.',
        scheme: 'success',
        title: 'Settings updated'
      });
    });
  }

  return (
    <div className='space-y-6'>
      <div className='space-y-1'>
        <h3 className='text-lg font-semibold'>General</h3>
        <p className='text-sm text-muted-foreground'>Manage your organization&apos;s basic information.</p>
      </div>

      <div className='space-y-4'>
        <div className='space-y-2'>
          <Label htmlFor='settings-org-name'>Organization Name</Label>
          <Input id='settings-org-name' value={name} onChange={e => setName(e.target.value)} />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='settings-org-slug'>URL Slug</Label>
          <div className='flex items-center gap-2'>
            <span className='text-sm text-muted-foreground'>courseroad.dev/organization/</span>
            <Input className='flex-1 opacity-60' id='settings-org-slug' disabled value={orgSlug} />
          </div>
          <p className='text-xs text-muted-foreground'>The URL slug cannot be changed after creation.</p>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='settings-org-logo'>Logo URL</Label>
          <div className='flex items-center gap-4'>
            <div className='flex size-14 shrink-0 items-center justify-center rounded-xl border bg-muted/50'>
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className='size-10 rounded-lg object-cover' alt='Logo preview' src={logoUrl} />
              ) : (
                <Building2 className='size-6 text-muted-foreground' />
              )}
            </div>
            <Input
              className='flex-1'
              id='settings-org-logo'
              placeholder='https://example.com/logo.png'
              value={logoUrl}
              onChange={e => setLogoUrl(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className='flex justify-end'>
        <Button disabled={isPending || !name.trim()} onClick={handleSave}>
          {isPending && <Loader2 className='mr-2 size-4 animate-spin' />}
          Save Changes
        </Button>
      </div>
    </div>
  );
}
