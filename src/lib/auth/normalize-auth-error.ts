import { ZodError } from 'zod';

import type { AuthError } from '@/types/auth.types';

/**
 * Normalizes various error types into a consistent AuthError structure
 * Handles Zod validation errors, Better Auth API errors, and generic errors
 *
 * @param error - The error to normalize (can be ZodError, Error, or unknown)
 * @param defaultMessage - Fallback message if error cannot be parsed
 * @returns Normalized AuthError object
 *
 * @example
 * ```ts
 * try {
 *     // ... some operation
 * } catch (error) {
 *     return { success: false, error: normalizeAuthError(error, 'Operation failed') };
 * }
 * ```
 */
export function normalizeAuthError(error: unknown, defaultMessage: string): AuthError {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
        const firstIssue = error.issues[0];
        const fieldPath = firstIssue?.path.join('.');

        return {
            code: 'VALIDATION_ERROR',
            message: firstIssue?.message || defaultMessage,
            ...(fieldPath && { field: fieldPath }), // Only include field if it exists
            originalError: error
        };
    }

    // Handle Better Auth API errors (they have a message property)
    if (error && typeof error === 'object' && 'message' in error) {
        return {
            code: 'API_ERROR',
            message: (error as { message: string }).message || defaultMessage,
            originalError: error
        };
    }

    // Handle standard Error objects
    if (error instanceof Error) {
        return {
            code: 'UNKNOWN_ERROR',
            message: error.message || defaultMessage,
            originalError: error
        };
    }

    // Fallback for unknown error types
    return {
        code: 'UNKNOWN_ERROR',
        message: defaultMessage,
        originalError: error
    };
}
