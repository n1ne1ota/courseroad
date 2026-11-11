'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@courseroad/kurume-ui';

interface CategoryInputProps {
  id?: string;
  onChange?: (value: string) => void;
  value?: string;
}

export function CategoryInput({ id, onChange, value }: CategoryInputProps) {
  return (
    <Select value={value || ''} {...(onChange ? { onValueChange: onChange } : {})}>
      <SelectTrigger className='w-full' id={id}>
        <SelectValue placeholder='Select' />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value='health-fitness'>Health & Fitness</SelectItem>
        <SelectItem value='business'>Business</SelectItem>
        <SelectItem value='design'>Design</SelectItem>
        <SelectItem value='development'>Development</SelectItem>
      </SelectContent>
    </Select>
  );
}
