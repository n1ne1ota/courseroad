import { describe, expect, it } from 'vitest';

import { shuffle } from '@/lib/utils/random';

describe('shuffle', () => {
    it('should return a new array with the same elements', () => {
        const input = [1, 2, 3, 4, 5];
        const result = shuffle(input);

        expect(result).not.toBe(input);
        expect(result).toHaveLength(input.length);
        expect(result).toEqual(expect.arrayContaining(input));
    });

    it('should handle empty arrays', () => {
        const input: number[] = [];
        const result = shuffle(input);
        expect(result).toEqual([]);
        expect(result).not.toBe(input);
    });

    it('should handle single element arrays', () => {
        const input = [1];
        const result = shuffle(input);
        expect(result).toEqual([1]);
        expect(result).not.toBe(input);
    });

    it('should eventually shuffle the array (statistical check)', () => {
        const input = [1, 2, 3, 4, 5];
        let isDifferent = false;

        // With 5 elements, there are 120 permutations.
        // The probability of getting the same order 100 times in a row is extremely low.
        for (let i = 0; i < 100; i++) {
            const result = shuffle(input);
            if (JSON.stringify(result) !== JSON.stringify(input)) {
                isDifferent = true;
                break;
            }
        }

        expect(isDifferent).toBe(true);
    });
});
