import 'server-only';

import { z } from 'zod';

import { AccessError } from '@/server/auth/session';
import { logs } from '@/server/logging/server';

/** Private GET responses share validation/error handling, never a cross-request cache. */
export async function privateRead<T>(read: () => Promise<T>) {
    const headers = { 'Cache-Control': 'private, no-store' };
    try {
        return Response.json({ data: await read() }, { headers });
    } catch (error) {
        if (error instanceof AccessError)
            return Response.json({ error: error.message }, { status: error.status, headers });
        if (error instanceof z.ZodError) return Response.json({ error: 'Invalid request' }, { status: 400, headers });
        logs.api.error('Private read failed', error);
        return Response.json({ error: 'Unable to load data' }, { status: 500, headers });
    }
}
