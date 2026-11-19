import 'server-only';

/** A feed position: pinned announcements come first, then newest first, with the id breaking ties. */
export interface FeedCursor {
    id: string;
    pinned: boolean;
    publishedAt: string;
}

export function encodeCursor(cursor: FeedCursor): string {
    return Buffer.from(JSON.stringify(cursor)).toString('base64url');
}

/** Returns `null` for anything that is not a cursor this module made, so a bad value starts the feed from the top. */
export function decodeCursor(value: string | undefined): FeedCursor | null {
    if (!value) return null;
    try {
        const parsed: unknown = JSON.parse(Buffer.from(value, 'base64url').toString('utf8'));
        if (
            parsed &&
            typeof parsed === 'object' &&
            'id' in parsed &&
            'pinned' in parsed &&
            'publishedAt' in parsed &&
            typeof parsed.id === 'string' &&
            typeof parsed.pinned === 'boolean' &&
            typeof parsed.publishedAt === 'string' &&
            !Number.isNaN(Date.parse(parsed.publishedAt))
        ) {
            return { id: parsed.id, pinned: parsed.pinned, publishedAt: parsed.publishedAt };
        }
    } catch {
        // fall through
    }
    return null;
}
