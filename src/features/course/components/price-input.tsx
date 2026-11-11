'use client';

import type { ChangeEvent } from 'react';
import { useEffect, useState } from 'react';

import { currencies } from '@/lib/config/data';

import { ButtonGroup } from '@courseroad/kurume-ui';
import { Input } from '@courseroad/kurume-ui';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@courseroad/kurume-ui';

interface PriceInputProps {
  id?: string;
  min?: number;
  onChange?: (value: number | undefined) => void;
  value?: number;
}

export function PriceInput({ id, min = 0, onChange, value }: PriceInputProps) {
  const [currency, setCurrency] = useState('USD');
  const [localValue, setLocalValue] = useState(value !== undefined ? value.toString() : '');

  // Synchronize local state with external value prop
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (value !== undefined && value !== 0) setLocalValue(value.toString());
    else setLocalValue('');
  }, [value]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;

    // Allow empty input
    if (newValue === '') {
      setLocalValue('');
      onChange?.(undefined);
      return;
    }

    // RegEx to allow distinct currency format:
    // ^\d*            Starts with any number of digits
    // (\.\d{0,2})?    Optionally followed by a dot and up to 2 decimal digits
    // $               End of string
    const regex = /^\d*(\.\d{0,2})?$/;

    if (regex.test(newValue)) {
      setLocalValue(newValue);
      const parsed = parseFloat(newValue);
      if (!isNaN(parsed) && parsed >= min) {
        onChange?.(parsed);
      } else if (newValue === '.') {
        // If just a dot, don't trigger invalid, but don't update parent with NaN
        // We keep localValue as '.'
      }
    }
  };

  const handleBlur = () => {
    if (localValue === '' || localValue === '.') {
      setLocalValue('');
      onChange?.(undefined);
      return;
    }

    const parsed = parseFloat(localValue);
    if (!isNaN(parsed)) {
      // The regex enforces max 2 digits.
      // We can ensure min value here too.
      if (parsed < min) {
        setLocalValue(min.toString());
        onChange?.(min);
      }
    }
  };

  return (
    <ButtonGroup>
      <Select value={currency} onValueChange={setCurrency}>
        <SelectTrigger className='font-mono'>{currency}</SelectTrigger>
        <SelectContent className='min-w-24'>
          {currencies.map(currency => (
            <SelectItem key={currency.value} value={currency.value}>
              {currency.value} <span className='text-muted-foreground'>{currency.label}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        className='text-right'
        id={id}
        type='text' // Use text to allow controlling the decimals precisely
        pattern='^\d*(\.\d{0,2})?$'
        placeholder='0.00'
        value={localValue}
        onBlur={handleBlur}
        onChange={handleInputChange}
      />
    </ButtonGroup>
  );
}
