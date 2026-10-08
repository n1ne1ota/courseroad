import { AsyncLocalStorage } from 'node:async_hooks';

export interface LogContext {
    [key: string]: unknown;
    organizationId?: string;
    requestId?: string;
    userId?: string;
}

export const logContextStorage = new AsyncLocalStorage<LogContext>();

export function getLogContext(): LogContext | undefined {
    return logContextStorage.getStore();
}

export function runWithLogContext<T>(context: LogContext, fn: () => T): T {
    return logContextStorage.run(context, fn);
}

export function runWithMergedLogContext<T>(context: Partial<LogContext>, fn: () => T): T {
    const parentContext = getLogContext();
    const mergedContext = parentContext ? { ...parentContext, ...context } : { ...context };
    return logContextStorage.run(mergedContext, fn);
}
