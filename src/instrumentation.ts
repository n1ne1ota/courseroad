import type { Instrumentation } from 'next';

import { log } from '@/server/logging/server';

/** Install provider fixtures only in an explicitly isolated, non-production browser test server. */
export async function register() {
    if (process.env.COURSEROAD_E2E !== '1') return;
    if (process.env.NODE_ENV === 'production') throw new Error('Browser provider fixtures cannot run in production.');
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const { startProviderFixtures } = await import('../tests/e2e/support/providers');
        startProviderFixtures();
    }
}

/** Write unhandled server request errors to the existing structured log stream. */
export const onRequestError: Instrumentation.onRequestError = (error, request, context) => {
    log.error('Unhandled server request error', error, {
        method: request.method,
        path: request.path,
        routePath: context.routePath,
        routeType: context.routeType
    });
};
