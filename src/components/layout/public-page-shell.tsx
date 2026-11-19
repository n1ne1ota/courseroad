import type { ReactNode } from 'react';

import { Card } from '@courseroad/iota-ui';

import { cn } from '@/lib/utils/cn';

export interface PublicPageShellProps {
  cardClassName?: string;
  children: ReactNode;
  className?: string;
  /** Wrap children in the shared frosted-glass Card frame. Set `false` for blocks that provide their own outer Card (e.g. `PricingComparison`). */
  framed?: boolean;
}

/**
 * Shared outer page shell for public `(public)` routes.
 * Aligns horizontally with `Footer` (`max-w-7xl px-6 lg:px-8`), unifies top/bottom spacing, and frames content
 * inside Iota's frosted-glass `Card` over `LandingBackground`.
 */
export function PublicPageShell({ cardClassName, children, className, framed = true }: PublicPageShellProps) {
  return (
    <div
      className={cn(
        'relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col px-6 pt-6 pb-4 sm:pt-8 sm:pb-6 lg:px-8',
        className
      )}
    >
      {framed ? (
        <Card
          className={cn('w-full flex-1 animate-public-card-enter px-4 py-14 sm:px-8 sm:py-16 lg:py-20', cardClassName)}
          shadow='xl'
          variant='frosted-glass'
        >
          {children}
        </Card>
      ) : (
        children
      )}
    </div>
  );
}

export interface PublicPageHeaderProps {
  align?: 'center' | 'start';
  className?: string;
  description?: ReactNode;
  eyebrow?: ReactNode;
  title: ReactNode;
}

/**
 * Quiet typographic page header shared across public routes, matching the `PricingComparison` heading hierarchy.
 */
export function PublicPageHeader({ align = 'center', className, description, eyebrow, title }: PublicPageHeaderProps) {
  return (
    <header
      className={cn(
        'flex flex-col gap-4',
        align === 'center' ? 'mx-auto max-w-2xl items-center text-center' : 'max-w-2xl items-start text-left',
        className
      )}
    >
      {eyebrow ? <p className='text-base font-medium text-foreground'>{eyebrow}</p> : null}
      <h1 className='text-4xl leading-[1.1] font-medium tracking-tight text-foreground sm:text-5xl'>{title}</h1>
      {description ? <p className='text-lg text-muted-foreground'>{description}</p> : null}
    </header>
  );
}
