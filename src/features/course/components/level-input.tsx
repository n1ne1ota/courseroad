'use client';

import { courseLevelEnum } from '@/features/course/schemas';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@courseroad/kurume-ui';

interface LevelInputProps {
  className?: string; // Standard prop, though SelectTrigger usually takes the class
  id?: string;
  onChange?: (value: string) => void;
  value?: string;
}

export function LevelInput({ id, onChange, value }: LevelInputProps) {
  return (
    <Select {...(onChange ? { onValueChange: onChange } : {})} value={value || ''}>
      <SelectTrigger className='w-full' id={id}>
        <SelectValue placeholder='Select' />
      </SelectTrigger>
      <SelectContent>
        {courseLevelEnum.options.map(level => (
          <SelectItem key={level} value={level}>
            {level}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
