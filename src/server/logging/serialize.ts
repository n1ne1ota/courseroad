/**
 * Serialization helpers for the production JSON log stream:
 * - redacts sensitive keys and signed-URL query parameters
 * - serializes errors including their `cause` chain
 * - guards against circular references and runaway depth
 */

export const REDACTED = '[REDACTED]';

const MAX_DEPTH = 6;
const MAX_CAUSE_DEPTH = 5;

/** Lowercased, punctuation-stripped key fragments that mark a value as sensitive */
const SENSITIVE_KEY_PARTS = [
    'apikey',
    'authorization',
    'cookie',
    'credential',
    'passwd',
    'password',
    'privatekey',
    'secret',
    'signature',
    'token'
];

/** Query parameters (signed URLs, API keys) whose values are replaced inside strings */
const SENSITIVE_QUERY_PARAM =
    /([?&][^=&\s"'#]*(?:signature|sig|token|secret|key|password|credential|authorization)[^=&\s"'#]*=)[^&\s"'#]+/gi;

export interface SerializedError {
    cause?: unknown;
    code?: unknown;
    message: string;
    name: string;
    stack?: string;
}

export function isSensitiveKey(key: string): boolean {
    const normalized = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    return SENSITIVE_KEY_PARTS.some(part => normalized.includes(part));
}

/** Replace the values of sensitive query parameters inside a string */
export function scrubString(value: string): string {
    return value.includes('=') ? value.replace(SENSITIVE_QUERY_PARAM, `$1${REDACTED}`) : value;
}

/**
 * Serialize an error and its `cause` chain into plain, redacted JSON-safe data.
 */
export function serializeError(error: unknown, depth = 0): unknown {
    if (!(error instanceof Error)) return redact(error);

    const serialized: SerializedError = {
        message: scrubString(error.message),
        name: error.name
    };

    if (error.stack) serialized.stack = scrubString(error.stack);

    const code = (error as { code?: unknown }).code;
    if (code !== undefined) serialized.code = code;

    if (error.cause !== undefined) {
        serialized.cause = depth < MAX_CAUSE_DEPTH ? serializeError(error.cause, depth + 1) : '[Truncated]';
    }

    return serialized;
}

/**
 * Deep-copy a value into JSON-safe data with sensitive keys and signed-URL parameters redacted.
 */
export function redact(value: unknown, depth = 0, seen: WeakSet<object> = new WeakSet()): unknown {
    if (value === null || value === undefined) return value;
    if (typeof value === 'string') return scrubString(value);
    if (typeof value === 'number' || typeof value === 'boolean') return value;
    if (typeof value === 'bigint') return value.toString();
    if (typeof value === 'symbol' || typeof value === 'function') return String(value);
    if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value.toISOString();
    if (value instanceof Error) return serializeError(value);

    if (typeof value === 'object') {
        if (seen.has(value)) return '[Circular]';
        if (depth >= MAX_DEPTH) return '[Truncated]';
        seen.add(value);

        const result = Array.isArray(value)
            ? value.map(item => redact(item, depth + 1, seen))
            : Object.fromEntries(
                  Object.entries(value).map(([key, item]) => [
                      key,
                      isSensitiveKey(key) ? REDACTED : redact(item, depth + 1, seen)
                  ])
              );

        seen.delete(value);
        return result;
    }

    return String(value);
}
