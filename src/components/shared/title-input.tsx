'use client';

import type { ChangeEvent } from 'react';

import { Input } from '@courseroad/kurume-ui';

interface TitleInputProps {
  disabled?: boolean;
  id?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  value?: string;
}

/** Title field shared by app-owned content editors. */
export function TitleInput({ disabled, id, onChange, value }: TitleInputProps) {
  return <Input id={id} autoComplete='off' disabled={disabled} placeholder='Title' value={value} onChange={onChange} />;
}
