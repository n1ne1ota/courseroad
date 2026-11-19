import type { ConsolaReporter, LogObject } from 'consola';

import kleur from 'kleur';

import { getLogContext } from './context';
import { redact, serializeError } from './serialize';

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

type Rgb = readonly [number, number, number];

/**
 * Log level colors (One Dark palette)
 */
const LEVEL_COLORS: Record<string, Rgb> = {
    debug: [86, 182, 194], // cyan
    error: [224, 108, 117], // red
    fail: [224, 108, 117],
    fatal: [198, 120, 221], // purple
    info: [97, 175, 239], // blue
    log: [171, 178, 191], // light gray
    ready: [152, 195, 121],
    start: [97, 175, 239],
    success: [152, 195, 121], // green
    trace: [92, 99, 112], // dark gray
    verbose: [92, 99, 112],
    warn: [229, 192, 123] // yellow
};

/** Levels rendered bold, and whose message text is tinted to match the level */
const BOLD_LEVELS = new Set(['error', 'fail', 'fatal', 'success']);
const TINTED_MESSAGE_LEVELS = new Set(['error', 'fail', 'fatal', 'warn']);

/**
 * Wrap text in a 24-bit ANSI color (no-op when colors are disabled)
 */
function paint(text: string, color: Rgb, bold = false): string {
    if (!areColorsEnabled()) return text;
    const [r, g, b] = color;
    return `\x1b[${bold ? '1;' : ''}38;2;${r};${g};${b}m${text}\x1b[0m`;
}

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
    const color = LEVEL_COLORS[type];
    const label = type.toUpperCase();
    return color ? paint(label, color, BOLD_LEVELS.has(type)) : label;
}

/**
 * Tint the message for warnings and errors so they stand out in a busy terminal
 */
function formatMessage(type: string, message: string): string {
    const color = LEVEL_COLORS[type];
    return color && TINTED_MESSAGE_LEVELS.has(type) ? paint(message, color) : message;
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
        const levelStr = formatLevel(type);

        // Message (first arg if it's a string)
        const [first, ...rest] = args;
        const message = typeof first === 'string' ? first : '';
        const extraArgs = typeof first === 'string' ? rest : args;

        // Build header: [time] [tag] LEVEL message, always separated by a single space
        const headerParts = [timestampStr, tagStr, levelStr, formatMessage(type, message)].filter(Boolean);
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
                    lines.push(formatJSON(restCtx));
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

/** Top-level keys owned by the logger; call-site fields that collide get a `field_` prefix */
const RESERVED_KEYS = new Set(['err', 'level', 'msg', 'tag', 'time']);

function renameReservedKeys(fields: Record<string, unknown>): Record<string, unknown> {
    return Object.fromEntries(
        Object.entries(fields).map(([key, value]) => [RESERVED_KEYS.has(key) ? `field_${key}` : key, value])
    );
}

/**
 * Production JSON log stream reporter
 * Emits one flat JSON object per line: `time`, `level`, `tag`, `msg`, request context
 * (AsyncLocalStorage) and call-site fields at the top level, plus `err` (with `cause` chain).
 * Sensitive keys and signed-URL query parameters are redacted before serialization.
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
                error = serializeError(arg);
            } else if (typeof arg === 'object') {
                const { error: errField, ...restObj } = arg as Record<string, unknown>;
                if (errField) error = serializeError(errField);
                Object.assign(meta, restObj);
            } else {
                meta.info = String(arg);
            }
        }

        // Flat entry: reserved fields first, then request context and call-site fields.
        const payload = {
            time: (date ?? new Date()).toISOString(),
            level: type,
            ...(tag ? { tag } : {}),
            msg: message,
            ...renameReservedKeys(redact(context) as Record<string, unknown>),
            ...renameReservedKeys(redact(meta) as Record<string, unknown>),
            ...(error !== undefined ? { err: error } : {})
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
