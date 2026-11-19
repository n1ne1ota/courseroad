import type { MetadataRoute } from 'next';
import { cacheLife } from 'next/cache';

import { globalData } from '@/lib/config/data';
import { publicPagePaths, routes } from '@/lib/routes';

import { getPublishedChangelog, getPublishedPosts } from '@/features/blog/server/loaders/cached-content';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    'use cache';
    cacheLife('days');

    const base = new URL(globalData.url);
    const now = new Date();
    const [posts, changelog] = await Promise.all([getPublishedPosts(), getPublishedChangelog()]);

    // Dated content reports its own date: the newest changelog entry for /changelog, the last edit for a post.
    const newestChangelog = changelog[0]?.date;
    const pages: MetadataRoute.Sitemap = publicPagePaths.map(p => ({
        changeFrequency: 'weekly',
        lastModified: p === routes.changelog && newestChangelog ? new Date(newestChangelog) : now,
        priority: p === '/' ? 1 : 0.8,
        url: new URL(p, base).toString()
    }));
    const postPages: MetadataRoute.Sitemap = posts.map(post => ({
        changeFrequency: 'monthly',
        lastModified: new Date(post.updatedAt ?? post.publishedAt),
        priority: 0.6,
        url: new URL(`${routes.blog}/${post.slug}`, base).toString()
    }));

    return [...pages, ...postPages];
}
