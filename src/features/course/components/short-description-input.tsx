'use client';

import type { ChangeEvent } from 'react';

import { Textarea } from '@courseroad/kurume-ui';

interface ShortDescriptionInputProps {
  disabled?: boolean;
  id?: string;
  onChange?: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  value?: string;
}

export function ShortDescriptionInput({ disabled, id, onChange, value }: ShortDescriptionInputProps) {
  return (
    <Textarea
      className='min-h-[100px]'
      id={id}
      disabled={disabled}
      placeholder='Short Description'
      value={value}
      onChange={onChange}
    />
  );
}
