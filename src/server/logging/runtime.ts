import { createConsola, LogLevels } from 'consola';

import { getLogContext, logContextStorage, runWithLogContext, runWithMergedLogContext } from './context';
import { devReporter, jsonReporter } from './reporter';

export { getLogContext, logContextStorage, runWithLogContext, runWithMergedLogContext };

const LOG_LEVEL_NAMES = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'] as const;
type LogLevelName = (typeof LOG_LEVEL_NAMES)[number];

/**
 * Resolve the minimum log level from `LOG_LEVEL` (trace | debug | info | warn | error | fatal).
 * Unset or invalid values fall back to `debug` in development and `info` everywhere else.
 * Read from `process.env` directly so logging never depends on validated app env.
 */
export function resolveLogLevel(): number {
    const raw = process.env.LOG_LEVEL?.trim().toLowerCase();
    if (raw && (LOG_LEVEL_NAMES as readonly string[]).includes(raw)) {
        return LogLevels[raw as LogLevelName];
    }
    return process.env.NODE_ENV === 'development' ? LogLevels.debug : LogLevels.info;
}

const baseConsola = createConsola({
    reporters: [
        {
            log(logObj, ctx) {
                if (process.env.NODE_ENV === 'development') {
                    devReporter.log(logObj, ctx);
                } else {
                    jsonReporter.log(logObj, ctx);
                }
            }
        }
    ]
});
baseConsola.level = resolveLogLevel();

export const log = {
    trace: (msg: string, ...args: unknown[]) => baseConsola.trace(msg, ...args),
    debug: (msg: string, ...args: unknown[]) => baseConsola.debug(msg, ...args),
    info: (msg: string, ...args: unknown[]) => baseConsola.info(msg, ...args),
    success: (msg: string, ...args: unknown[]) => baseConsola.success(msg, ...args),
    warn: (msg: string, ...args: unknown[]) => baseConsola.warn(msg, ...args),
    error: (msg: string, error?: unknown, ...args: unknown[]) => {
        baseConsola.error(msg, error, ...args);
    },
    fatal: (msg: string, error?: unknown, ...args: unknown[]) => {
        baseConsola.fatal(msg, error, ...args);
    },
    child: (bindings: Record<string, unknown>) => {
        const childLogger = baseConsola.withTag(String(Object.values(bindings)[0] || 'child'));
        return {
            trace: (msg: string, ...args: unknown[]) => childLogger.trace(msg, ...args),
            debug: (msg: string, ...args: unknown[]) => childLogger.debug(msg, ...args),
            info: (msg: string, ...args: unknown[]) => childLogger.info(msg, ...args),
            success: (msg: string, ...args: unknown[]) => childLogger.success(msg, ...args),
            warn: (msg: string, ...args: unknown[]) => childLogger.warn(msg, ...args),
            error: (msg: string, error?: unknown, ...args: unknown[]) => {
                childLogger.error(msg, error, ...args);
            },
            fatal: (msg: string, error?: unknown, ...args: unknown[]) => {
                childLogger.fatal(msg, error, ...args);
            }
        };
    }
};

export const logs = {
    api: log.child({ tag: 'api' }),
    auth: log.child({ tag: 'auth' }),
    db: log.child({ tag: 'database' }),
    upload: log.child({ tag: 'upload' })
};

export type Log = typeof log;
export default log;
