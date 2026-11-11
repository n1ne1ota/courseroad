import { createConsola } from 'consola';

const consola = createConsola({
    level: 3 // Default browser logging (info, success, warn, error)
});

export const log = {
    trace: (msg: string, ...args: unknown[]) => consola.trace(msg, ...args),
    debug: (msg: string, ...args: unknown[]) => consola.debug(msg, ...args),
    info: (msg: string, ...args: unknown[]) => consola.info(msg, ...args),
    success: (msg: string, ...args: unknown[]) => consola.success(msg, ...args),
    warn: (msg: string, ...args: unknown[]) => consola.warn(msg, ...args),
    error: (msg: string, ...args: unknown[]) => consola.error(msg, ...args),
    fatal: (msg: string, ...args: unknown[]) => consola.fatal(msg, ...args),
    child: (tags: Record<string, unknown>) => {
        const childConsola = consola.withTag(String(Object.values(tags)[0] || 'child'));
        return {
            trace: (msg: string, ...args: unknown[]) => childConsola.trace(msg, ...args),
            debug: (msg: string, ...args: unknown[]) => childConsola.debug(msg, ...args),
            info: (msg: string, ...args: unknown[]) => childConsola.info(msg, ...args),
            success: (msg: string, ...args: unknown[]) => childConsola.success(msg, ...args),
            warn: (msg: string, ...args: unknown[]) => childConsola.warn(msg, ...args),
            error: (msg: string, ...args: unknown[]) => childConsola.error(msg, ...args),
            fatal: (msg: string, ...args: unknown[]) => childConsola.fatal(msg, ...args)
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
