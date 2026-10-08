import 'server-only';

import type { Route } from 'next';
import { notFound, redirect } from 'next/navigation';

import { PageDestination } from '@/server/auth/read-errors';
import { AccessError } from '@/server/auth/session';

/** Pages opt into navigation; HTTP and direct DAL callers receive ordinary errors. */
export async function readForPage<T>(read: () => Promise<T>): Promise<T> {
    try {
        return await read();
    } catch (error) {
        if (error instanceof PageDestination) redirect(error.href as Route);
        if (error instanceof AccessError) {
            if (error.status === 401) redirect('/sign-in');
            notFound();
        }
        throw error;
    }
}
