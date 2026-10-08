import type { Instrumentation } from 'next';

import { log } from '@/server/logging/server';

/** Write unhandled server request errors to the existing structured log stream. */
export const onRequestError: Instrumentation.onRequestError = (error, request, context) => {
    log.error('Unhandled server request error', error, {
        method: request.method,
        path: request.path,
        routePath: context.routePath,
        routeType: context.routeType
    });
};
