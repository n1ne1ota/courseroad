import { createConsola } from 'consola';

import { getLogContext, logContextStorage, runWithLogContext, runWithMergedLogContext } from './context';
import { devReporter, jsonReporter } from './reporter';

export { getLogContext, logContextStorage, runWithLogContext, runWithMergedLogContext };

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
baseConsola.level = process.env.NODE_ENV === 'development' ? 4 : 3;

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
