import 'server-only';

import { type NextRequest } from 'next/server';

import { auth } from '@/server/auth/auth';
import { log, runWithMergedLogContext } from '@/server/logging/server';

export interface ApiContext {
    params?: Record<string, string>;
}

export interface AuthenticatedContext extends ApiContext {
    session: {
        user: {
            id: string;
            email: string;
            name?: string;
        };
    };
}

export type ApiHandler = (req: NextRequest, context: ApiContext) => Promise<Response> | Response;

export type AuthenticatedApiHandler = (req: NextRequest, context: AuthenticatedContext) => Promise<Response> | Response;

/**
 * Wrapper for API routes that require authentication
 */
export function withAuth(handler: AuthenticatedApiHandler) {
    return async (req: NextRequest, context: ApiContext = {}) => {
        try {
            const session = await auth.api.getSession({ headers: req.headers });

            if (!session?.user) {
                log.warn('Unauthorized API access attempt', {
                    method: req.method,
                    url: req.url
                });

                return Response.json({ error: 'Unauthorized' }, { status: 401 });
            }

            const authenticatedContext: AuthenticatedContext = {
                ...context,
                session
            };

            return await handler(req, authenticatedContext);
        } catch (error) {
            log.error('Auth middleware error', error, {
                method: req.method,
                url: req.url
            });

            return Response.json({ error: 'Internal server error' }, { status: 500 });
        }
    };
}

/**
 * Wrapper for API routes with error handling and logging
 */
export function withErrorHandling(handler: ApiHandler) {
    return async (req: NextRequest, context: ApiContext = {}) => {
        const startTime = Date.now();
        const requestId = crypto.randomUUID();

        return runWithMergedLogContext({ requestId }, async () => {
            try {
                const response = await handler(req, context);
                const duration = Date.now() - startTime;

                // Log slow requests
                if (duration > 500) {
                    log.warn('Slow API request', {
                        duration,
                        method: req.method,
                        requestId,
                        url: req.url
                    });
                }

                return response;
            } catch (error) {
                const duration = Date.now() - startTime;

                log.error('API route error', error, {
                    duration,
                    method: req.method,
                    requestId,
                    url: req.url
                });

                if (error instanceof Error) {
                    // Don't expose internal errors in production
                    const message = process.env.NODE_ENV === 'development' ? error.message : 'Internal server error';

                    return Response.json({ error: message }, { status: 500 });
                }

                return Response.json({ error: 'Internal server error' }, { status: 500 });
            }
        });
    };
}

/**
 * Rate limiting helper (would use Redis in production)
 */
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function withRateLimit(
    limit: number = 100,
    windowMs: number = 15 * 60 * 1000 // 15 minutes
) {
    return function (handler: ApiHandler) {
        return async (req: NextRequest, context: ApiContext = {}) => {
            const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';

            const now = Date.now();
            const key = `${clientIP}:${req.url}`;
            const record = requestCounts.get(key);

            if (record && now < record.resetTime) {
                if (record.count >= limit) {
                    log.warn('Rate limit exceeded', {
                        clientIP,
                        count: record.count,
                        url: req.url
                    });

                    return Response.json({ error: 'Rate limit exceeded' }, { status: 429 });
                }

                record.count++;
            } else {
                requestCounts.set(key, {
                    count: 1,
                    resetTime: now + windowMs
                });
            }

            return await handler(req, context);
        };
    };
}

/**
 * Combine multiple middleware
 */
export function compose(...middlewares: Array<(handler: ApiHandler) => ApiHandler>) {
    return function (handler: ApiHandler) {
        return middlewares.reduceRight((acc, middleware) => middleware(acc), handler);
    };
}
