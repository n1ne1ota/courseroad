import { randomInt } from 'node:crypto';

/**
 * Shuffles an array using the Fisher-Yates algorithm and cryptographically secure randomness.
 * Returns a new array.
 * @param array The array to shuffle.
 * @returns A new shuffled array.
 */
export function shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
        const j = randomInt(0, i + 1);
        const temp = result[i] as T;
        result[i] = result[j] as T;
        result[j] = temp;
    }
    return result;
}
