'use client';

import { MarkdownEditor } from '@courseroad/kurume-ui/editor';

interface DescriptionInputProps {
  disabled?: boolean;
  onChange?: (value: string) => void;
  value?: string;
}

export function DescriptionInput({ disabled = false, onChange, value }: DescriptionInputProps) {
  return (
    <MarkdownEditor
      disabled={disabled}
      placeholder='Write your course description here'
      value={value || ''}
      {...(onChange ? { onChange } : {})}
    />
  );
}
