import type { ConsolaReporter, LogObject } from 'consola';

import kleur from 'kleur';

import { getLogContext } from './context';

/**
 * Check if ANSI colors should be enabled based on TTY and environment overrides
 */
function areColorsEnabled(): boolean {
    if (typeof process === 'undefined') return false;
    const env = process.env || {};
    if (env.NO_COLOR !== undefined && env.NO_COLOR !== '0') return false;
    if (env.FORCE_COLOR !== undefined && env.FORCE_COLOR !== '0') return true;

    const stdout = (process as unknown as { stdout?: { isTTY?: boolean } })['stdout'];
    return !!(stdout && stdout.isTTY);
}

/**
 * One Dark theme color helpers using ANSI RGB escape codes
 * Colors match One Dark Pro theme for better terminal syntax highlighting
 */
const oneDark = {
    // Strings: #98c379 (green)
    string: (text: string) => (areColorsEnabled() ? `\x1b[38;2;152;195;121m${text}\x1b[0m` : text),
    // Numbers: #d19a66 (orange)
    number: (text: string) => (areColorsEnabled() ? `\x1b[38;2;209;154;102m${text}\x1b[0m` : text),
    // Keys/Properties: #e06c75 (red)
    key: (text: string) => (areColorsEnabled() ? `\x1b[38;2;224;108;117m${text}\x1b[0m` : text),
    // Booleans: #c678dd (purple)
    boolean: (text: string) => (areColorsEnabled() ? `\x1b[38;2;198;120;221m${text}\x1b[0m` : text),
    // Null/undefined: #a9b1be (gray)
    null: (text: string) => (areColorsEnabled() ? `\x1b[38;2;169;177;190m${text}\x1b[0m` : text),
    // Curly braces: #e9c605 (yellow)
    brace: (text: string) => (areColorsEnabled() ? `\x1b[38;2;233;198;5m${text}\x1b[0m` : text),
    // Colons: #52a0a6 (bright teal)
    colon: (text: string) => (areColorsEnabled() ? `\x1b[38;2;82;160;166m${text}\x1b[0m` : text)
};

/**
 * Log level icons
 */
const LOG_ICONS: Record<string, string> = {
    debug: '⚠',
    error: '✕',
    fatal: '✕',
    info: '🛈',
    log: '•',
    success: '✔',
    trace: '➔',
    verbose: '…',
    warn: '⚠'
};

/**
 * Format JSON with One Dark syntax highlighting.
 * Keys: coral red, Strings: green, Numbers: orange, Booleans: purple, Null: gray
 */
function formatJSON(obj: unknown, indent = 0): string {
    const indentStr = ' '.repeat(indent);
    const nextIndent = indent + 4;

    if (obj === null) return oneDark.null('null');
    if (obj === undefined) return oneDark.null('undefined');
    if (typeof obj === 'string') return oneDark.string(`"${obj}"`);
    if (typeof obj === 'number') return oneDark.number(String(obj));
    if (typeof obj === 'boolean') return oneDark.boolean(String(obj));

    if (Array.isArray(obj)) {
        if (!obj.length) return `${oneDark.brace('[')}${oneDark.brace(']')}`;
        const nextIndentStr = ' '.repeat(nextIndent);
        const items = obj.map(item => `${nextIndentStr}${formatJSON(item, nextIndent)}`).join(',\n');
        return `${oneDark.brace('[')}\n${items}\n${indentStr}${oneDark.brace(']')}`;
    }

    if (typeof obj === 'object') {
        const entries = Object.entries(obj);
        if (!entries.length) return `${oneDark.brace('{')}${oneDark.brace('}')}`;
        const nextIndentStr = ' '.repeat(nextIndent);
        const formatted = entries
            .map(([key, value]) => {
                const formattedKey = oneDark.key(`"${key}"`);
                const formattedValue = formatJSON(value, nextIndent);
                const isMultiline = formattedValue.includes('\n');

                if (isMultiline) {
                    const lines = formattedValue.split('\n');
                    const firstLine = lines[0]?.trimStart() ?? '';
                    const restLines = lines.slice(1);
                    const rest = restLines.length > 0 ? `\n${restLines.join('\n')}` : '';
                    return `${nextIndentStr}${formattedKey}${oneDark.colon(':')} ${firstLine}${rest}`;
                }

                return `${nextIndentStr}${formattedKey}${oneDark.colon(':')} ${formattedValue}`;
            })
            .join(',\n');
        return `${oneDark.brace('{')}\n${formatted}\n${indentStr}${oneDark.brace('}')}`;
    }

    return String(obj);
}

/**
 * Format a stack trace with cyan file paths and gray line/column numbers
 */
function formatStack(stack: string): string {
    return stack
        .split('\n')
        .map(line => {
            const match = line.match(/^\s*at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/);
            if (!match || !match[2] || !match[3]) return `    ${line.trim()}`;
            const [, func, file, lineNum, col] = match;
            const location = col && lineNum ? `:${lineNum}:${col}` : lineNum ? `:${lineNum}` : '';
            return `    at ${func} (${kleur.cyan(file)}${kleur.gray(location)})`;
        })
        .join('\n');
}

/**
 * Extract error details from an unknown value
 */
function extractError(error: unknown): { name: string; message: string; stack?: string } | null {
    if (error instanceof Error) {
        return {
            message: error.message,
            name: error.name,
            ...(error.stack && { stack: error.stack })
        };
    }

    if (typeof error === 'object' && error !== null) {
        const err = error as { message?: string; name?: string; stack?: string };
        return {
            message: err.message || String(error),
            name: err.name || 'Error',
            ...(err.stack && { stack: err.stack })
        };
    }

    return null;
}

/**
 * Format the log level badge with appropriate color
 */
function formatLevel(type: string): string {
    const label = type.toUpperCase().padEnd(7);
    switch (type) {
        case 'trace':
        case 'verbose':
            return kleur.gray(label);
        case 'debug':
            return kleur.cyan(label);
        case 'info':
        case 'log':
            return kleur.green(label);
        case 'success':
        case 'ready':
        case 'start':
            return kleur.green().bold(label);
        case 'warn':
            return kleur.yellow(label);
        case 'error':
        case 'fail':
            return kleur.red().bold(label);
        case 'fatal':
            return kleur.magenta().bold(label);
        default:
            return label;
    }
}

/**
 * Custom Dev ConsolaReporter with One Dark syntax-highlighted JSON output
 * and AsyncLocalStorage log context tracking.
 */
export const devReporter: ConsolaReporter = {
    log(logObj: LogObject) {
        kleur.enabled = areColorsEnabled();
        const { args, date, tag, type } = logObj;

        // Timestamp
        const timestamp = date ? date.toLocaleTimeString() : new Date().toLocaleTimeString();
        const timestampStr = kleur.gray(`[${timestamp}]`);

        // Tag
        const tagStr = tag ? kleur.gray(`[${tag}]`) : '';

        // Level
        const icon = LOG_ICONS[type] ?? '•';
        const levelStr = formatLevel(type);

        // Message (first arg if it's a string)
        const [first, ...rest] = args;
        const message = typeof first === 'string' ? first : '';
        const extraArgs = typeof first === 'string' ? rest : args;

        // Build header
        const headerParts = [timestampStr, tagStr, icon, levelStr, message].filter(Boolean);
        const lines: string[] = [headerParts.join(' ')];

        // Active Log Context
        const context = getLogContext();
        if (context && Object.keys(context).length > 0) {
            lines.push(`    ${kleur.gray('context:')} ${formatJSON(context, 4).trimStart()}`);
        }

        // Extra args: errors and context objects
        for (const arg of extraArgs) {
            if (arg === null || arg === undefined) continue;

            // Try to treat it as an error first
            const errorDetails = extractError(arg);
            if (errorDetails && (arg instanceof Error || (typeof arg === 'object' && 'stack' in (arg as object)))) {
                lines.push('');
                lines.push(kleur.red().bold(`${errorDetails.name}: ${errorDetails.message}`));
                if (errorDetails.stack) lines.push(formatStack(errorDetails.stack));
                continue;
            }

            // Plain objects / arrays → One Dark JSON
            if (typeof arg === 'object') {
                const obj = arg as Record<string, unknown>;
                const { error, ...restCtx } = obj;

                if (error) {
                    const errDetails = extractError(error);
                    if (errDetails) {
                        lines.push('');
                        lines.push(kleur.red().bold(`${errDetails.name}: ${errDetails.message}`));
                        if (errDetails.stack) lines.push(formatStack(errDetails.stack));
                    }
                }

                if (Object.keys(restCtx).length) {
                    lines.push('');
                    lines.push(formatJSON(restCtx, 4));
                }
                continue;
            }

            // Primitives that weren't the message
            lines.push(`    ${String(arg)}`);
        }

        const output = lines.join('\n');

        const stdout =
            typeof process !== 'undefined'
                ? (process as unknown as { stdout?: { write?: (str: string) => unknown } })['stdout']
                : undefined;
        if (stdout && typeof stdout.write === 'function') {
            stdout.write(`${output}\n`);
        } else {
            // eslint-disable-next-line no-console
            console.log(output);
        }
    }
};

/**
 * Production JSON log stream reporter
 * Serializes trace metadata (from AsyncLocalStorage) and errors in a single-line JSON.
 */
export const jsonReporter: ConsolaReporter = {
    log(logObj: LogObject) {
        const { args, date, tag, type } = logObj;
        const context = getLogContext() || {};

        const [first, ...rest] = args;
        const message = typeof first === 'string' ? first : '';
        const extraArgs = typeof first === 'string' ? rest : args;

        let error: unknown = undefined;
        const meta: Record<string, unknown> = {};

        for (const arg of extraArgs) {
            if (arg === null || arg === undefined) continue;

            if (arg instanceof Error) {
                error = {
                    message: arg.message,
                    name: arg.name,
                    stack: arg.stack
                };
            } else if (typeof arg === 'object') {
                const { error: errField, ...restObj } = arg as Record<string, unknown>;
                if (errField) {
                    if (errField instanceof Error) {
                        error = {
                            message: errField.message,
                            name: errField.name,
                            stack: errField.stack
                        };
                    } else {
                        error = errField;
                    }
                }
                Object.assign(meta, restObj);
            } else {
                meta.info = String(arg);
            }
        }

        const payload = {
            context,
            level: type,
            message,
            ...(Object.keys(meta).length > 0 ? { meta } : {}),
            ...(error !== undefined ? { error } : {}),
            tag,
            timestamp: date ? date.toISOString() : new Date().toISOString()
        };

        const output = JSON.stringify(payload);

        const stdout =
            typeof process !== 'undefined'
                ? (process as unknown as { stdout?: { write?: (str: string) => unknown } })['stdout']
                : undefined;
        if (stdout && typeof stdout.write === 'function') {
            stdout.write(`${output}\n`);
        } else {
            // eslint-disable-next-line no-console
            console.log(output);
        }
    }
};
