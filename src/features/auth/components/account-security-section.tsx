'use client';

import { Separator } from '@courseroad/kurume-ui';

import { PasskeySettings } from './passkey-settings';
import { TwoFactorSettings } from './two-factor-settings';

/**
 * User-scoped account security panel grouping two-factor authentication and
 * passkey management. Shared across organization and platform (B2C) settings
 * surfaces so every persona gets consistent security controls.
 */
export function AccountSecuritySection() {
  return (
    <div className='space-y-8'>
      <TwoFactorSettings />
      <Separator />
      <PasskeySettings />
    </div>
  );
}
