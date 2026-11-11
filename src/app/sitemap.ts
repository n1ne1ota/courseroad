import type { MetadataRoute } from 'next';

import { globalData } from '@/lib/config/data';
import { publicPagePaths } from '@/lib/routes';

export const revalidate = 86400; // 1 day

export default function sitemap(): MetadataRoute.Sitemap {
    const base = new URL(globalData.url);
    const now = new Date();
    const paths = publicPagePaths;

    return paths.map(p => ({
        changeFrequency: 'weekly',
        lastModified: now,
        priority: p === '/' ? 1 : 0.8,
        url: new URL(p, base).toString()
    }));
}
