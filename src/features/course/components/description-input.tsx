'use client';

import { MarkdownEditor } from '@courseroad/kurume-ui/editor';

interface DescriptionInputProps {
  onChange?: (value: string) => void;
  value?: string;
}

export function DescriptionInput({ onChange, value }: DescriptionInputProps) {
  return (
    <MarkdownEditor
      placeholder='Write your course description here'
      value={value || ''}
      {...(onChange ? { onChange } : {})}
    />
  );
}
