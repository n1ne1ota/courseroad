'use client';

/** Account-level two-factor settings shared by platform and organization dashboards. */

import { useState, useTransition } from 'react';

import { InputOTP, showToast } from '@courseroad/iota-ui';
import { Button, Input, Label, Separator } from '@courseroad/kurume-ui';
import { Check, Copy, Loader2, Lock, ShieldAlert, ShieldCheck } from 'lucide-react';
import QRCode from 'react-qr-code';

import { authClient } from '@/lib/auth/auth-client';

type SetupStep = 'idle' | 'password-prompt-enable' | 'setup' | 'password-prompt-disable';

export function TwoFactorSettings() {
  const { data: session, refetch } = authClient.useSession();
  const [isPending, startTransition] = useTransition();

  const [step, setStep] = useState<SetupStep>('idle');
  const [password, setPassword] = useState('');
  const [totpURI, setTotpURI] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [copied, setCopied] = useState(false);

  const isEnabled = !!session?.user?.twoFactorEnabled;

  function resetForm() {
    setStep('idle');
    setPassword('');
    setTotpURI('');
    setBackupCodes([]);
    setVerificationCode('');
    setCopied(false);
  }

  function handleInitiateEnable() {
    setPassword('');
    setStep('password-prompt-enable');
  }

  function handleInitiateDisable() {
    setPassword('');
    setStep('password-prompt-disable');
  }

  function handleVerifyPasswordToEnable() {
    if (!password) return;

    startTransition(async () => {
      const result = await authClient.twoFactor.enable({ method: 'totp', password });

      if (result.error) {
        showToast({
          description: result.error.message ?? 'Invalid password. Please try again.',
          scheme: 'danger',
          title: 'Authentication Failed'
        });
        return;
      }

      if (result.data?.method === 'totp') {
        setTotpURI(result.data.totpURI);
        setBackupCodes(result.data.backupCodes);
        setStep('setup');
      }
    });
  }

  function handleConfirmSetup() {
    if (verificationCode.length !== 6) return;

    startTransition(async () => {
      const result = await authClient.twoFactor.verifyTotp({
        code: verificationCode
      });

      if (result.error) {
        showToast({
          description: result.error.message ?? 'Invalid code. Check your app and try again.',
          scheme: 'danger',
          title: 'Verification Failed'
        });
        return;
      }

      showToast({
        description: 'Two-factor authentication is now active on your account.',
        scheme: 'success',
        title: '2FA Enabled'
      });

      await refetch();
      resetForm();
    });
  }

  function handleDisable() {
    if (!password) return;

    startTransition(async () => {
      const result = await authClient.twoFactor.disable({ password });

      if (result.error) {
        showToast({
          description: result.error.message ?? 'Invalid password. Please try again.',
          scheme: 'danger',
          title: 'Disable Failed'
        });
        return;
      }

      showToast({
        description: 'Two-factor authentication has been disabled.',
        scheme: 'success',
        title: '2FA Disabled'
      });

      await refetch();
      resetForm();
    });
  }

  function copyBackupCodes() {
    if (backupCodes.length === 0) return;
    navigator.clipboard.writeText(backupCodes.join('\n'));
    setCopied(true);
    showToast({
      description: 'Backup codes copied to clipboard.',
      scheme: 'success',
      title: 'Copied'
    });
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className='max-w-xl space-y-6'>
      <div className='space-y-1'>
        <h3 className='flex items-center gap-2 text-lg font-semibold'>
          <Lock className='size-5 text-primary' />
          Two-Factor Authentication (2FA)
        </h3>
        <p className='text-sm text-muted-foreground'>
          Secure your account by adding an extra validation step during sign in.
        </p>
      </div>

      {step === 'idle' && (
        <div className='flex items-start gap-4 rounded-xl border bg-card p-5 shadow-sm'>
          <div className='mt-0.5 flex shrink-0 items-center justify-center rounded-lg bg-muted p-2'>
            {isEnabled ? (
              <ShieldCheck className='size-6 text-success' />
            ) : (
              <ShieldAlert className='size-6 text-warning' />
            )}
          </div>
          <div className='flex-1 space-y-3'>
            <div>
              <p className='text-sm font-medium'>Status: {isEnabled ? 'Enabled' : 'Disabled'}</p>
              <p className='mt-1 text-xs text-muted-foreground'>
                {isEnabled
                  ? 'Your account is protected by an authenticator application code.'
                  : 'Two-factor authentication is not active. We highly recommend turning it on.'}
              </p>
            </div>
            <div>
              {isEnabled ? (
                <Button size='sm' variant='secondary' onClick={handleInitiateDisable}>
                  Disable 2FA
                </Button>
              ) : (
                <Button size='sm' onClick={handleInitiateEnable}>
                  Enable 2FA
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {step === 'password-prompt-enable' && (
        <div className='space-y-4 rounded-xl border bg-card p-5 shadow-sm'>
          <div className='space-y-2'>
            <Label htmlFor='2fa-enable-password'>Confirm Password</Label>
            <p className='text-xs text-muted-foreground'>
              Please enter your password to set up two-factor authentication.
            </p>
            <Input
              id='2fa-enable-password'
              type='password'
              autoFocus
              placeholder='Enter your password'
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <div className='flex justify-end gap-2'>
            <Button size='sm' variant='ghost' onClick={resetForm}>
              Cancel
            </Button>
            <Button disabled={isPending || !password} size='sm' onClick={handleVerifyPasswordToEnable}>
              {isPending && <Loader2 className='mr-2 size-4 animate-spin' />}
              Continue
            </Button>
          </div>
        </div>
      )}

      {step === 'setup' && (
        <div className='space-y-6 rounded-xl border bg-card p-5 shadow-sm'>
          <div className='space-y-2 text-center sm:text-left'>
            <h4 className='text-sm font-semibold'>1. Scan the QR Code</h4>
            <p className='text-xs text-muted-foreground'>
              Scan this QR code with an authenticator app (like Google Authenticator, 1Password, or Authy) to link your
              account.
            </p>
            {totpURI && (
              <div className='mx-auto mt-3 flex max-w-[200px] justify-center rounded-lg border bg-white p-4 sm:mx-0'>
                <QRCode size={168} value={totpURI} />
              </div>
            )}
          </div>

          <Separator />

          <div className='space-y-3'>
            <h4 className='text-sm font-semibold'>2. Save Backup Codes</h4>
            <p className='text-xs text-muted-foreground'>
              Store these backup codes in a secure password manager. They can be used to recover access to your account
              if you lose your phone.
            </p>
            <div className='grid grid-cols-2 gap-2 rounded-lg border bg-muted/50 p-3 text-center font-mono text-xs select-all'>
              {backupCodes.map((code, idx) => (
                <div key={idx} className='p-1'>
                  {code}
                </div>
              ))}
            </div>
            <Button className='w-full text-xs sm:w-auto' size='sm' variant='secondary' onClick={copyBackupCodes}>
              {copied ? <Check className='mr-1 size-3.5 text-success' /> : <Copy className='mr-1 size-3.5' />}
              Copy Backup Codes
            </Button>
          </div>

          <Separator />

          <div className='space-y-3'>
            <h4 className='text-sm font-semibold'>3. Verify Authenticator Code</h4>
            <p className='text-xs text-muted-foreground'>
              Enter the 6-digit code shown in your authenticator app to verify the setup.
            </p>
            <div className='flex justify-center py-1 sm:justify-start'>
              <InputOTP
                autoFocus
                color='primary'
                disabled={isPending}
                maxLength={6}
                value={verificationCode}
                onChange={setVerificationCode}
              />
            </div>
          </div>

          <div className='flex justify-end gap-2 pt-2'>
            <Button size='sm' variant='ghost' onClick={resetForm}>
              Cancel
            </Button>
            <Button disabled={isPending || verificationCode.length !== 6} size='sm' onClick={handleConfirmSetup}>
              {isPending && <Loader2 className='mr-2 size-4 animate-spin' />}
              Confirm Setup
            </Button>
          </div>
        </div>
      )}

      {step === 'password-prompt-disable' && (
        <div className='space-y-4 rounded-xl border border-destructive/20 bg-destructive/5 p-5 shadow-sm'>
          <div className='space-y-2'>
            <h4 className='text-sm font-semibold text-destructive'>Disable Two-Factor Authentication</h4>
            <p className='text-xs text-muted-foreground'>
              This will lower your account security. Please enter your password to confirm disabling 2FA.
            </p>
            <Input
              id='2fa-disable-password'
              type='password'
              autoFocus
              placeholder='Enter your password'
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <div className='flex justify-end gap-2'>
            <Button size='sm' variant='ghost' onClick={resetForm}>
              Cancel
            </Button>
            <Button disabled={isPending || !password} size='sm' variant='destructive' onClick={handleDisable}>
              {isPending && <Loader2 className='mr-2 size-4 animate-spin' />}
              Disable 2FA
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
