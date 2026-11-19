'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@courseroad/kurume-ui';

import { courseLevelEnum } from '@/features/course/schemas/course-schemas';

interface LevelInputProps {
  className?: string; // Standard prop, though SelectTrigger usually takes the class
  id?: string;
  onChange?: (value: string) => void;
  value?: string;
}

export function LevelInput({ id, onChange, value }: LevelInputProps) {
  return (
    <Select
      value={value || null}
      onValueChange={next => {
        if (next !== null) onChange?.(next);
      }}
    >
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
