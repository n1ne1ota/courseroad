'use client';

import type { HTMLAttributes } from 'react';

import { Header } from './header';
import { MobileHeader } from './mobile-header';

export function Navigation(props: HTMLAttributes<HTMLElement>) {
  return (
    <>
      {/* Desktop Navigation */}
      <Header {...props} />

      {/* Mobile Navigation */}
      <MobileHeader />
    </>
  );
}
