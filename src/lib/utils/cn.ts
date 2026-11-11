import type { ClassValue } from 'clsx';

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names with tailwind-merge for proper Tailwind CSS class merging.
 *
 * @example
 * ```ts
 * cn('px-2 py-1', condition && 'bg-red-500', 'px-4')
 * // => 'py-1 bg-red-500 px-4' (px-2 is merged away by px-4)
 * ```
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
