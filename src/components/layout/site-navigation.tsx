'use client';

import type { ComponentProps } from 'react';

import { DesktopNavbar } from './desktop-navbar';
import { MobileNavbar } from './mobile-navbar';

/**
 * The landing page navigation. Renders both navbars; each hides itself outside its own breakpoint.
 *
 * @param props - Props forwarded to the desktop navbar
 */
export function SiteNavigation(props: ComponentProps<typeof DesktopNavbar>) {
  return (
    <>
      <DesktopNavbar {...props} />
      <MobileNavbar />
    </>
  );
}
