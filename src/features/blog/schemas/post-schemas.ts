import { z } from 'zod';

import { calendarDate } from './shared-schemas';

/** The allowed post tags. Adding one is a deliberate change here, so a typo in a post fails the build. */
export const POST_TAGS = ['announcement', 'product', 'teaching', 'learning', 'engineering'] as const;

export const postFrontmatterSchema = z
    .object({
        author: z.string().min(1),
        description: z.string().min(1).max(160, 'Keep the description to 160 characters or fewer'),
        draft: z.boolean().optional(),
        publishedAt: calendarDate,
        tags: z.array(z.enum(POST_TAGS)).max(5),
        title: z.string().min(1),
        updatedAt: calendarDate.optional()
    })
    .strict();

export type PostFrontmatter = z.infer<typeof postFrontmatterSchema>;
