import 'server-only';

import type { z } from 'zod';

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

import matter from 'gray-matter';

import { changelogFrontmatterSchema } from '../schemas/changelog-schemas';
import { postFrontmatterSchema } from '../schemas/post-schemas';
import { isPublished, SLUG_PATTERN, todayUtc } from '../schemas/shared-schemas';

import type { ChangelogEntry, PostEntry } from '../types/content-types';

/** The content folders live inside the feature, next to the code that reads them. */
export const DEFAULT_CONTENT_DIR = path.join(process.cwd(), 'src', 'features', 'blog', 'content');

export interface ContentOptions {
    /** Root folder holding `posts/` and `changelog/`. Defaults to the feature's `content` folder. */
    contentDir?: string;
    /** Include drafts and future-dated entries. Defaults to true outside production. */
    includeUnpublished?: boolean;
    /** The moment used for the publishing rule. Defaults to now. */
    now?: Date;
}

/** A content file that is invalid. The message names the file and the field so a build log points straight at it. */
export class ContentError extends Error {
    constructor(file: string, message: string, field?: string) {
        super(field ? `${file}: ${field}: ${message}` : `${file}: ${message}`);
        this.name = 'ContentError';
    }
}

const CHANGELOG_FILENAME = /^(\d{4}-\d{2}-\d{2})-([a-z0-9-]+)$/;

function resolveOptions(options: ContentOptions) {
    return {
        contentDir: options.contentDir ?? DEFAULT_CONTENT_DIR,
        includeUnpublished: options.includeUnpublished ?? process.env.NODE_ENV !== 'production',
        today: todayUtc(options.now)
    };
}

async function listMdxFiles(directory: string): Promise<string[]> {
    try {
        const names = await readdir(directory);
        return names.filter(name => name.endsWith('.mdx')).sort();
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
        throw error;
    }
}

function parseFrontmatter<Schema extends z.ZodType>(schema: Schema, data: unknown, file: string): z.infer<Schema> {
    const result = schema.safeParse(data);
    if (result.success) return result.data;

    const issue = result.error.issues[0];
    const field = issue?.path.join('.') || undefined;
    // `.strict()` reports an unknown key as an issue on the object with the key names in `keys`.
    const unknownKeys = issue && 'keys' in issue ? (issue as { keys?: string[] }).keys : undefined;
    throw new ContentError(
        file,
        unknownKeys ? `unknown field ${unknownKeys.join(', ')}` : (issue?.message ?? 'invalid'),
        field
    );
}

async function readEntryFile(directory: string, filename: string) {
    const file = path.relative(process.cwd(), path.join(directory, filename)).split(path.sep).join('/');
    const source = await readFile(path.join(directory, filename), 'utf8');

    try {
        return { data: matter(source).data as unknown, file };
    } catch (error) {
        throw new ContentError(file, `could not read the frontmatter (${(error as Error).message})`);
    }
}

/** All posts, newest first. Unpublished posts are left out unless `includeUnpublished` is on. */
export async function getPosts(options: ContentOptions = {}): Promise<PostEntry[]> {
    const { contentDir, includeUnpublished, today } = resolveOptions(options);
    const directory = path.join(contentDir, 'posts');
    const posts: PostEntry[] = [];

    for (const filename of await listMdxFiles(directory)) {
        const slug = filename.slice(0, -'.mdx'.length);
        const { data, file } = await readEntryFile(directory, filename);

        if (!SLUG_PATTERN.test(slug)) throw new ContentError(file, 'the filename must match ^[a-z0-9-]+$', 'slug');

        const frontmatter = parseFrontmatter(postFrontmatterSchema, data, file);
        const entry = { ...frontmatter, slug };
        if (includeUnpublished || isPublished({ date: frontmatter.publishedAt, draft: frontmatter.draft }, today))
            posts.push(entry);
    }

    return posts.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt) || a.slug.localeCompare(b.slug));
}

export async function getPost(slug: string, options: ContentOptions = {}): Promise<PostEntry | undefined> {
    return (await getPosts(options)).find(post => post.slug === slug);
}

/** The newer and older neighbours of a post in the published list, for previous and next links. */
export async function getAdjacentPosts(slug: string, options: ContentOptions = {}) {
    const posts = await getPosts(options);
    const index = posts.findIndex(post => post.slug === slug);
    if (index === -1) return { newer: undefined, older: undefined };

    return { newer: posts[index - 1], older: posts[index + 1] };
}

/** All changelog entries, newest first. */
export async function getChangelog(options: ContentOptions = {}): Promise<ChangelogEntry[]> {
    const { contentDir, includeUnpublished, today } = resolveOptions(options);
    const directory = path.join(contentDir, 'changelog');
    const entries: ChangelogEntry[] = [];

    for (const filename of await listMdxFiles(directory)) {
        const id = filename.slice(0, -'.mdx'.length);
        const { data, file } = await readEntryFile(directory, filename);

        const match = CHANGELOG_FILENAME.exec(id);
        if (!match) throw new ContentError(file, 'the filename must be <YYYY-MM-DD>-<slug>.mdx', 'slug');

        const frontmatter = parseFrontmatter(changelogFrontmatterSchema, data, file);
        if (frontmatter.date !== match[1]) {
            throw new ContentError(
                file,
                `date ${frontmatter.date} does not match the filename date ${match[1]}`,
                'date'
            );
        }

        const entry = { ...frontmatter, id, slug: match[2] as string };
        if (includeUnpublished || isPublished(frontmatter, today)) entries.push(entry);
    }

    return entries.sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
}
