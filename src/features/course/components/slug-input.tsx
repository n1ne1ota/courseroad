'use client';

import type { ChangeEvent } from 'react';

import { Button } from '@courseroad/kurume-ui';
import { Input } from '@courseroad/kurume-ui';

interface SlugInputProps {
  baseTitle?: string;
  id?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement> | string) => void;
  value?: string;
}

export function SlugInput({ baseTitle, id, onChange, value }: SlugInputProps) {
  const toSlug = (str: string): string => {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const handleGenerate = () => {
    if (baseTitle && onChange) {
      onChange(toSlug(baseTitle));
    }
  };

  return (
    <div className='flex gap-2'>
      <Input
        className='flex-1'
        id={id}
        autoComplete='off'
        placeholder='slug-example'
        value={value}
        onChange={onChange}
      />
      <Button type='button' variant='secondary' onClick={handleGenerate}>
        Generate
      </Button>
    </div>
  );
}
