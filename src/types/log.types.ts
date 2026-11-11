/**
 * Logger types and interfaces
 */

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogContext {
    [key: string]: unknown;
    action?: string;
    component?: string;
    requestId?: string;
    userId?: string;
}

export interface Logger {
    child(bindings: Record<string, unknown>): Logger;
    debug(message: string, context?: LogContext): void;
    error(message: string, error?: unknown, context?: LogContext): void;
    fatal(message: string, error?: unknown, context?: LogContext): void;
    info(message: string, context?: LogContext): void;
    trace(message: string, context?: LogContext): void;
    warn(message: string, context?: LogContext): void;
}
