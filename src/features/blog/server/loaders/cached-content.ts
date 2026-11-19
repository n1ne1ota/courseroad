import 'server-only';

import { cacheLife } from 'next/cache';

import { getAdjacentPosts, getChangelog, getPost, getPosts } from '../content';

/**
 * The published content, cached for a day. Pages are prerendered, and these caches are what let a future-dated entry
 * appear on its date without a deploy: the cache revalidates daily, matching the sitemap.
 */
export async function getPublishedPosts() {
    'use cache';
    cacheLife('days');

    return getPosts();
}

export async function getPublishedPost(slug: string) {
    'use cache';
    cacheLife('days');

    return getPost(slug);
}

export async function getPublishedAdjacentPosts(slug: string) {
    'use cache';
    cacheLife('days');

    return getAdjacentPosts(slug);
}

export async function getPublishedChangelog() {
    'use cache';
    cacheLife('days');

    return getChangelog();
}
