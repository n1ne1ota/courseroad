import { globalData } from '@/lib/config/data';

import { getPublishedPosts } from '@/features/blog/server/loaders/cached-content';
import { postsFeed } from '@/features/blog/server/rss';

export async function GET() {
    const posts = await getPublishedPosts();

    return new Response(postsFeed(posts, globalData.url, globalData.name), {
        headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' }
    });
}
