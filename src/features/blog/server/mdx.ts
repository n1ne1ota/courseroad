import 'server-only';

import type { ComponentType } from 'react';

/**
 * Loads the compiled body of a post or changelog entry. `@next/mdx` compiles each file at build time; the import path
 * is a template so Turbopack bundles every file in the folder. Slugs and ids come from the validated content loader,
 * never from a raw request value.
 */
export async function loadPostBody(slug: string): Promise<ComponentType> {
    const mdx = (await import(`../content/posts/${slug}.mdx`)) as { default: ComponentType };
    return mdx.default;
}

export async function loadChangelogBody(id: string): Promise<ComponentType> {
    const mdx = (await import(`../content/changelog/${id}.mdx`)) as { default: ComponentType };
    return mdx.default;
}
