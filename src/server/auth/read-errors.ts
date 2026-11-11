import 'server-only';

import { AccessError } from '@/server/auth/session';

/** A read can describe the next destination without performing navigation. */
export class PageDestination extends Error {
    constructor(readonly href: string) {
        super('Navigation required');
    }
}

export function destination(href: string): never {
    throw new PageDestination(href);
}

export function missingResource(): never {
    throw new AccessError('Not found', 404);
}
