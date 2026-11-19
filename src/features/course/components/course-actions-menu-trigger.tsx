'use client';

import type { JSX } from 'react';

import { Button, DropdownMenuTrigger } from '@courseroad/kurume-ui';

import { Ellipsis } from 'lucide-react';

interface ActionsMenuTriggerProps {
  /** Accessible name; includes which item the menu belongs to. */
  label: string;
  disabled?: boolean;
  className?: string;
}

/** Ghost `⋯` button that opens an actions menu. */
export function ActionsMenuTrigger({ label, disabled, className }: ActionsMenuTriggerProps): JSX.Element {
  return (
    <DropdownMenuTrigger
      disabled={disabled}
      render={<Button className={className} type='button' size='icon-sm' variant='ghost' aria-label={label} />}
    >
      <Ellipsis className='h-4 w-4' />
    </DropdownMenuTrigger>
  );
}
