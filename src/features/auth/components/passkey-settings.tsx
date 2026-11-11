'use client';

import { useState } from 'react';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Fingerprint, KeyRound, Loader2, Pencil, Plus, ShieldAlert, Trash2, X } from 'lucide-react';

import { deletePasskey, listPasskeys, registerPasskey, renamePasskey } from '@/lib/auth/auth-client';
import { usePasskeySupported } from '@/lib/auth/use-passkey-support';

import { Button, Input, Label, Separator } from '@courseroad/kurume-ui';

import type { PasskeyInfo } from '@/types/auth.types';

const PASSKEYS_QUERY_KEY = ['passkeys'] as const;

function formatDate(value: PasskeyInfo['createdAt']): string {
  if (!value) return 'Unknown date';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown date';
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * User-scoped passkey (WebAuthn) management panel.
 *
 * Lists the current user's registered passkeys and supports registering,
 * renaming, and removing credentials. Renders a graceful notice when the
 * browser does not support WebAuthn. Reusable across organization and
 * platform settings surfaces.
 */
export function PasskeySettings() {
  const supported = usePasskeySupported();
  const queryClient = useQueryClient();

  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const { data: passkeys = [], isLoading } = useQuery({
    enabled: supported,
    queryFn: async () => {
      const result = await listPasskeys();
      if (!result.success) throw new Error(result.error.message);
      return result.data ?? [];
    },
    queryKey: PASSKEYS_QUERY_KEY
  });

  const invalidatePasskeys = () => queryClient.invalidateQueries({ queryKey: PASSKEYS_QUERY_KEY });

  const registerMutation = useMutation({
    mutationFn: (name: string) => registerPasskey(name),
    onSuccess: result => {
      if (result.success) {
        setNewName('');
        setIsAdding(false);
        void invalidatePasskeys();
      }
    }
  });

  const renameMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => renamePasskey(id, name),
    onSuccess: result => {
      if (result.success) {
        setEditingId(null);
        setEditingName('');
        void invalidatePasskeys();
      }
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePasskey(id),
    onSuccess: result => {
      if (result.success) {
        setConfirmDeleteId(null);
        void invalidatePasskeys();
      }
    }
  });

  const isMutating = registerMutation.isPending || renameMutation.isPending || deleteMutation.isPending;

  function handleRegister() {
    registerMutation.mutate(newName.trim() || 'My Passkey');
  }

  function handleRename(id: string) {
    const name = editingName.trim();
    if (!name) return;
    renameMutation.mutate({ id, name });
  }

  return (
    <div className='max-w-xl space-y-6'>
      <div className='space-y-1'>
        <h3 className='flex items-center gap-2 text-lg font-semibold'>
          <KeyRound className='size-5 text-primary' />
          Passkeys
        </h3>
        <p className='text-sm text-muted-foreground'>
          Sign in without a password using your device biometrics (Touch ID, Face ID, Windows Hello) or a security key.
        </p>
      </div>

      {!supported ? (
        <div className='flex items-start gap-4 rounded-xl border border-warning/30 bg-warning/5 p-5 shadow-sm'>
          <ShieldAlert className='mt-0.5 size-6 shrink-0 text-warning' />
          <div className='space-y-1'>
            <p className='text-sm font-medium'>Passkeys are not supported here</p>
            <p className='text-xs text-muted-foreground'>
              Your current browser or device does not support WebAuthn. Try a modern browser or a device with biometric
              support.
            </p>
          </div>
        </div>
      ) : (
        <div className='space-y-4'>
          {isLoading ? (
            <div className='flex items-center justify-center rounded-xl border bg-card p-8 text-muted-foreground'>
              <Loader2 className='size-5 animate-spin' />
            </div>
          ) : passkeys.length === 0 ? (
            <div className='flex items-start gap-4 rounded-xl border bg-card p-5 shadow-sm'>
              <div className='mt-0.5 flex shrink-0 items-center justify-center rounded-lg bg-muted p-2'>
                <Fingerprint className='size-6 text-muted-foreground' />
              </div>
              <div className='space-y-1'>
                <p className='text-sm font-medium'>No passkeys yet</p>
                <p className='text-xs text-muted-foreground'>
                  Register a passkey to enable fast, phishing-resistant sign in.
                </p>
              </div>
            </div>
          ) : (
            <ul className='space-y-2'>
              {passkeys.map(passkey => (
                <li key={passkey.id} className='flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm'>
                  <div className='flex shrink-0 items-center justify-center rounded-lg bg-muted p-2'>
                    <Fingerprint className='size-5 text-primary' />
                  </div>
                  {editingId === passkey.id ? (
                    <div className='flex flex-1 items-center gap-2'>
                      <Input
                        autoFocus
                        value={editingName}
                        onChange={e => setEditingName(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleRename(passkey.id);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                      />
                      <Button
                        disabled={isMutating || !editingName.trim()}
                        size='sm'
                        onClick={() => handleRename(passkey.id)}
                      >
                        {renameMutation.isPending ? (
                          <Loader2 className='size-4 animate-spin' />
                        ) : (
                          <Check className='size-4' />
                        )}
                      </Button>
                      <Button size='sm' variant='ghost' onClick={() => setEditingId(null)}>
                        <X className='size-4' />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className='min-w-0 flex-1'>
                        <p className='truncate text-sm font-medium'>{passkey.name || 'Unnamed passkey'}</p>
                        <p className='text-xs text-muted-foreground'>Added {formatDate(passkey.createdAt)}</p>
                      </div>
                      {confirmDeleteId === passkey.id ? (
                        <div className='flex items-center gap-2'>
                          <Button
                            disabled={isMutating}
                            size='sm'
                            variant='destructive'
                            onClick={() => deleteMutation.mutate(passkey.id)}
                          >
                            {deleteMutation.isPending && <Loader2 className='mr-1 size-4 animate-spin' />}
                            Confirm
                          </Button>
                          <Button size='sm' variant='ghost' onClick={() => setConfirmDeleteId(null)}>
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className='flex items-center gap-1'>
                          <Button
                            size='sm'
                            variant='ghost'
                            aria-label='Rename passkey'
                            onClick={() => {
                              setEditingId(passkey.id);
                              setEditingName(passkey.name || '');
                            }}
                          >
                            <Pencil className='size-4' />
                          </Button>
                          <Button
                            size='sm'
                            variant='ghost'
                            aria-label='Remove passkey'
                            onClick={() => setConfirmDeleteId(passkey.id)}
                          >
                            <Trash2 className='size-4 text-destructive' />
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}

          <Separator />

          {isAdding ? (
            <div className='space-y-3 rounded-xl border bg-card p-5 shadow-sm'>
              <div className='space-y-2'>
                <Label htmlFor='passkey-name'>Passkey name</Label>
                <p className='text-xs text-muted-foreground'>
                  Give this passkey a recognizable name, such as the device you are registering.
                </p>
                <Input
                  id='passkey-name'
                  autoFocus
                  placeholder='e.g. MacBook Touch ID'
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleRegister();
                  }}
                />
              </div>
              <div className='flex justify-end gap-2'>
                <Button
                  size='sm'
                  variant='ghost'
                  onClick={() => {
                    setIsAdding(false);
                    setNewName('');
                  }}
                >
                  Cancel
                </Button>
                <Button disabled={registerMutation.isPending} size='sm' onClick={handleRegister}>
                  {registerMutation.isPending && <Loader2 className='mr-2 size-4 animate-spin' />}
                  Register
                </Button>
              </div>
            </div>
          ) : (
            <Button size='sm' onClick={() => setIsAdding(true)}>
              <Plus className='mr-2 size-4' />
              Register new passkey
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
