import type { ChangelogFrontmatter } from '../schemas/changelog-schemas';
import type { PostFrontmatter } from '../schemas/post-schemas';

export interface PostEntry extends PostFrontmatter {
    slug: string;
}

export interface ChangelogEntry extends ChangelogFrontmatter {
    /** The filename without its extension, for example `2026-11-12-course-publishing`. */
    id: string;
    slug: string;
}
