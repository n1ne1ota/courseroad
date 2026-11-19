import { z } from 'zod';

import { calendarDate } from './shared-schemas';

export const CHANGELOG_KINDS = ['added', 'improved', 'fixed'] as const;
export const CHANGELOG_AUDIENCES = ['learners', 'creators', 'organizations'] as const;

export const changelogFrontmatterSchema = z
    .object({
        audience: z.array(z.enum(CHANGELOG_AUDIENCES)).min(1),
        date: calendarDate,
        draft: z.boolean().optional(),
        kind: z.enum(CHANGELOG_KINDS),
        title: z.string().min(1)
    })
    .strict();

export type ChangelogFrontmatter = z.infer<typeof changelogFrontmatterSchema>;
export type ChangelogKind = (typeof CHANGELOG_KINDS)[number];
export type ChangelogAudience = (typeof CHANGELOG_AUDIENCES)[number];
