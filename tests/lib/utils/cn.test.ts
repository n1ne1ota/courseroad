import { describe, expect, it } from 'vitest';

import { cn } from '@/lib/utils/cn';

describe('cn utility', () => {
    it('should merge tailwind classes properly', () => {
        const result = cn('text-red-500', 'text-blue-500');
        expect(result).toBe('text-blue-500');
    });

    it('should handle conditional classes', () => {
        const isActive = true;
        const result = cn('base-class', isActive && 'active-class', !isActive && 'inactive-class');
        expect(result).toBe('base-class active-class');
    });

    it('should handle arrays of classes', () => {
        const result = cn(['class-1', 'class-2'], 'class-3');
        expect(result).toBe('class-1 class-2 class-3');
    });

    it('should ignore undefined, null, and false values', () => {
        const result = cn('class-1', undefined, null, false, 'class-2');
        expect(result).toBe('class-1 class-2');
    });
});
