import { type ZodError, type ZodType } from 'zod';

import { type EmailValidationOptions, normalizeEmail, validateEmailField } from '@/lib/utils/email-validation';

export interface ValidationResult<T> {
    data?: T;
    errors?: Record<string, string>;
    success: boolean;
}

export function validateForm<T>(schema: ZodType<T>, data: unknown): ValidationResult<T> {
    try {
        const validatedData = schema.parse(data);

        return {
            data: validatedData,
            success: true
        };
    } catch (error) {
        if (error instanceof Error && 'issues' in error) {
            const zodError = error as ZodError;
            const errors: Record<string, string> = {};

            zodError.issues.forEach(issue => {
                const path = issue.path.join('.');

                errors[path] = issue.message;
            });

            return {
                errors,
                success: false
            };
        }

        return {
            errors: {
                _form: 'Validation failed'
            },
            success: false
        };
    }
}

export function getFormData(form: FormData): Record<string, string> {
    const data: Record<string, string> = {};

    for (const [key, value] of form.entries()) {
        if (typeof value === 'string') {
            data[key] = value;
        }
    }

    return data;
}

/**
 * Normalize form data (trim strings, normalize emails)
 */
export function normalizeFormData(data: Record<string, string>): Record<string, string> {
    const normalized: Record<string, string> = {};

    for (const [key, value] of Object.entries(data)) {
        if (key.toLowerCase().includes('email')) {
            normalized[key] = normalizeEmail(value);
        } else {
            normalized[key] = value.trim();
        }
    }

    return normalized;
}

/**
 * Enhanced form validation with email-specific validation
 */
export function validateFormWithEmail<T>(
    schema: ZodType<T>,
    data: unknown,
    _emailOptions?: EmailValidationOptions
): ValidationResult<T> {
    try {
        // Normalize the data first
        let normalizedData = data;

        if (typeof data === 'object' && data !== null) {
            normalizedData = normalizeFormData(data as Record<string, string>);
        }

        const validatedData = schema.parse(normalizedData);

        return {
            data: validatedData,
            success: true
        };
    } catch (error) {
        if (error instanceof Error && 'issues' in error) {
            const zodError = error as ZodError;
            const errors: Record<string, string> = {};

            zodError.issues.forEach(issue => {
                const path = issue.path.join('.');

                errors[path] = issue.message;
            });

            return {
                errors,
                success: false
            };
        }

        return {
            errors: {
                _form: 'Validation failed'
            },
            success: false
        };
    }
}

/**
 * Validate email field with enhanced feedback
 */
export function validateEmailWithSuggestion(
    email: string,
    options?: EmailValidationOptions
): {
    success: boolean;
    error?: string | undefined;
    suggestion?: string | undefined;
    warning?: string | undefined;
} {
    const result = validateEmailField(email, options);

    // Add warnings for edge cases
    let warning: string | undefined;

    if (result.success && email.includes('+')) {
        warning = 'Email aliases may not work with all services';
    }

    return {
        ...result,
        warning
    };
}
