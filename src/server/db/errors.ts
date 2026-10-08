import 'server-only';

import { Prisma } from '@prisma/client';

export type ActionErrorResponse = {
    errors?: Record<string, string[]>;
    message: string;
    success: boolean;
};

/**
 * Optional logger interface for Prisma error handling.
 * If not provided, errors are logged to console.error.
 */
export interface DatabaseLogger {
    error: (message: string, error?: unknown) => void;
}

const defaultLogger: DatabaseLogger = {
    error: (message, error) => console.error(`[database] ${message}`, error)
};

/**
 * Handles common Prisma errors and maps them to user-friendly form field errors.
 *
 * @param error - The caught error
 * @param defaultMessage - A generic error message to fall back on
 * @param fieldMap - An optional mapping of Prisma field names to Form field names (e.g. { slug: 'title' })
 * @param logger - Optional logger instance (defaults to console)
 * @returns An object suitable for returning from a Server Action
 */
export function handlePrismaError(
    error: unknown,
    defaultMessage = 'An unexpected database error occurred',
    fieldMap?: Record<string, string>,
    logger: DatabaseLogger = defaultLogger
): ActionErrorResponse {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // P2002: Unique constraint failed
        if (error.code === 'P2002') {
            const targets = (error.meta?.target as string[]) || [];
            logger.error(`Unique constraint failed on fields: ${targets.join(', ')}`, error);

            const errors: Record<string, string[]> = {};
            let hasMappedError = false;

            targets.forEach(target => {
                // Determine the form field name, default to the db field name
                const formField = fieldMap?.[target] || target;
                if (!errors[formField]) {
                    errors[formField] = [];
                }

                // Specific friendly message for known fields or generic unique message
                if (target === 'slug' || formField === 'title' || formField === 'name') {
                    errors[formField].push(`A record with this ${formField} already exists.`);
                } else if (target === 'email') {
                    errors[formField].push('This email is already in use.');
                } else {
                    errors[formField].push(`This ${formField} must be unique.`);
                }
                hasMappedError = true;
            });

            const result: ActionErrorResponse = {
                message: 'A record with this information already exists.',
                success: false
            };
            if (hasMappedError) {
                result.errors = errors;
            }
            return result;
        }

        // P2003: Foreign key constraint failed
        if (error.code === 'P2003') {
            logger.error(`Foreign key constraint failed on field: ${error.meta?.field_name}`, error);
            return {
                message: 'The operation failed because a related record does not exist or cannot be updated.',
                success: false
            };
        }

        // P2025: Record not found
        if (error.code === 'P2025') {
            logger.error('Database record not found', error);
            return {
                message: 'The requested record was not found.',
                success: false
            };
        }

        logger.error(`Unhandled Prisma Known Error (${error.code})`, error);
    } else if (error instanceof Prisma.PrismaClientValidationError) {
        logger.error('Prisma Validation Error', error);
        return {
            message: 'Invalid data provided to the database.',
            success: false
        };
    } else {
        logger.error(defaultMessage, error);
    }

    return {
        message: defaultMessage,
        success: false
    };
}
