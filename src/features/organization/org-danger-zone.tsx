'use client';

import { useTransition } from 'react';

import type { Route } from 'next';
import { useRouter } from 'next/navigation';

import { Loader2, Trash2 } from 'lucide-react';

import { authClient } from '@/lib/auth/auth-client';

import { showToast } from '@courseroad/iota-ui';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button
} from '@courseroad/kurume-ui';

type OrgDangerZoneProps = {
  orgId: string;
  orgName: string;
};

/**
 * Danger zone section with org deletion confirmation dialog.
 * Only visible to org owners.
 */
export function OrgDangerZone({ orgId, orgName }: OrgDangerZoneProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await authClient.organization.delete({
        organizationId: orgId
      });

      if (result.error) {
        showToast({
          description: result.error.message ?? 'Failed to delete organization.',
          scheme: 'danger',
          title: 'Deletion failed'
        });
        return;
      }

      showToast({
        description: `"${orgName}" has been permanently deleted.`,
        scheme: 'success',
        title: 'Organization deleted'
      });

      router.push('/select-organization' as Route);
    });
  }

  return (
    <div className='space-y-4'>
      <div className='space-y-1'>
        <h3 className='text-lg font-semibold text-destructive'>Danger Zone</h3>
        <p className='text-sm text-muted-foreground'>Irreversible and destructive actions for this organization.</p>
      </div>

      <div className='rounded-xl border border-destructive/20 bg-destructive/5 p-4'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='font-medium'>Delete this organization</p>
            <p className='text-sm text-muted-foreground'>
              All courses, members, and data will be permanently removed. This action cannot be undone.
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size='sm' variant='destructive'>
                <Trash2 className='mr-2 size-4' />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete &quot;{orgName}&quot;?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the organization, all its courses, member associations, learner data, and
                  quiz submissions. This action is irreversible.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction disabled={isPending} variant='destructive' onClick={handleDelete}>
                  {isPending && <Loader2 className='mr-2 size-4 animate-spin' />}
                  Delete Organization
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
