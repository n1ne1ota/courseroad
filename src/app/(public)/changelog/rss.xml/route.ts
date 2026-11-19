import { globalData } from '@/lib/config/data';

import { getPublishedChangelog } from '@/features/blog/server/loaders/cached-content';
import { changelogFeed } from '@/features/blog/server/rss';

export async function GET() {
    const entries = await getPublishedChangelog();

    return new Response(changelogFeed(entries, globalData.url, globalData.name), {
        headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' }
    });
}
