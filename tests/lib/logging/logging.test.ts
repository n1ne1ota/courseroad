import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import log, { getLogContext, logs, runWithLogContext, runWithMergedLogContext } from '@/server/logging/server';

// Preserve the former logging suite's mock cleanup in the web test environment.
afterEach(() => vi.restoreAllMocks());

describe('Logging Context Storage', () => {
    it('should propagate log context', () => {
        expect(getLogContext()).toBeUndefined();

        runWithLogContext({ userId: 'user-123', organizationId: 'org-456' }, () => {
            const context = getLogContext();
            expect(context).toBeDefined();
            expect(context?.userId).toBe('user-123');
            expect(context?.organizationId).toBe('org-456');
        });

        expect(getLogContext()).toBeUndefined();
    });

    it('should merge log contexts in nested scopes', () => {
        runWithLogContext({ userId: 'user-123', organizationId: 'org-456' }, () => {
            expect(getLogContext()?.userId).toBe('user-123');
            expect(getLogContext()?.requestId).toBeUndefined();

            runWithMergedLogContext({ requestId: 'req-789', userId: 'user-override' }, () => {
                const nested = getLogContext();
                expect(nested?.userId).toBe('user-override');
                expect(nested?.organizationId).toBe('org-456');
                expect(nested?.requestId).toBe('req-789');
            });

            // Restores parent context
            expect(getLogContext()?.userId).toBe('user-123');
            expect(getLogContext()?.requestId).toBeUndefined();
        });
    });
});

describe('Production error logging', () => {
    beforeEach(() => {
        vi.stubEnv('NODE_ENV', 'production');
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllEnvs();
    });

    it('writes error details and request context to the local JSON stream', () => {
        const write = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
        const error = new Error('Database connection failed');

        runWithLogContext({ requestId: 'req-123', organizationId: 'org-456' }, () => {
            log.error('API call failed', error, { method: 'POST' });
        });

        expect(write).toHaveBeenCalledTimes(1);
        const payload = JSON.parse(String(write.mock.calls[0]?.[0]));
        expect(payload).toMatchObject({
            level: 'error',
            message: 'API call failed',
            context: { requestId: 'req-123', organizationId: 'org-456' },
            meta: { method: 'POST' },
            error: { name: 'Error', message: 'Database connection failed', stack: error.stack }
        });
    });

    it('retains fatal error details and tags on child loggers', () => {
        const write = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
        logs.auth.fatal('Fatal auth failure', new TypeError('Invalid input'));

        const payload = JSON.parse(String(write.mock.calls[0]?.[0]));
        expect(payload).toMatchObject({
            level: 'fatal',
            tag: 'auth',
            message: 'Fatal auth failure',
            error: { name: 'TypeError', message: 'Invalid input' }
        });
    });
});

describe('Smart ANSI Colors in Dev Reporter', () => {
    let stdoutWriteSpy: any;
    let originalStdout: any;

    beforeEach(() => {
        originalStdout = process.stdout;

        // Mock process.stdout.write
        stdoutWriteSpy = vi.fn();
        Object.defineProperty(process, 'stdout', {
            value: {
                ...process.stdout,
                write: stdoutWriteSpy,
                isTTY: true
            },
            writable: true,
            configurable: true
        });
    });

    afterEach(() => {
        vi.unstubAllEnvs();

        Object.defineProperty(process, 'stdout', {
            value: originalStdout,
            writable: true,
            configurable: true
        });
    });

    it('should print colored output in TTY dev reporter environment by default', () => {
        vi.stubEnv('NODE_ENV', 'development');
        vi.stubEnv('NO_COLOR', undefined as any);
        vi.stubEnv('FORCE_COLOR', undefined as any);

        log.info('TTY log info');

        expect(stdoutWriteSpy).toHaveBeenCalled();
        const written = stdoutWriteSpy.mock.calls[0][0];
        // Verify it has ANSI color code characters (starts with \x1b or kleur color wraps)
        expect(written).toContain('\x1b[');
    });

    it('should omit colors when NO_COLOR is set', () => {
        vi.stubEnv('NODE_ENV', 'development');
        vi.stubEnv('NO_COLOR', '1');
        vi.stubEnv('FORCE_COLOR', undefined as any);

        log.info('Plain log info');

        expect(stdoutWriteSpy).toHaveBeenCalled();
        const written = stdoutWriteSpy.mock.calls[0][0];
        // Verify it doesn't contain ANSI coloring escape codes
        expect(written).not.toContain('\x1b[');
    });

    it('should force colors when FORCE_COLOR is set', () => {
        vi.stubEnv('NODE_ENV', 'development');
        vi.stubEnv('NO_COLOR', undefined as any);
        vi.stubEnv('FORCE_COLOR', '1');
        // Even if TTY is false
        (process.stdout as any).isTTY = false;

        log.info('Forced colored log');

        expect(stdoutWriteSpy).toHaveBeenCalled();
        const written = stdoutWriteSpy.mock.calls[0][0];
        expect(written).toContain('\x1b[');
    });
});
