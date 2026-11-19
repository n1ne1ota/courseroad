import { z } from 'zod';

export const ANNOUNCEMENT_TITLE_MAX = 120;
export const ANNOUNCEMENT_BODY_MAX = 50_000;
export const FEED_PAGE_SIZE = 20;
/** Most announcements that may be emailed per course or organization in a rolling 24 hours. */
export const EMAILED_PER_DAY_LIMIT = 3;

const fields = {
    bodyHtml: z.string().min(1, 'Write a message').max(ANNOUNCEMENT_BODY_MAX, 'The message is too long'),
    pinned: z.boolean().default(false),
    title: z.string().trim().min(1, 'Add a title').max(ANNOUNCEMENT_TITLE_MAX, 'The title is too long')
};

/** Where an announcement is posted. A course announcement carries the course; an organization one the organization. */
export const authoringTargetSchema = z.discriminatedUnion('scope', [
    z.object({ courseId: z.uuid(), scope: z.literal('Course') }),
    z.object({ organizationId: z.uuid(), scope: z.literal('Organization') })
]);
export type AuthoringTarget = z.infer<typeof authoringTargetSchema>;

export const createAnnouncementSchema = z.discriminatedUnion('scope', [
    z.object({ ...fields, courseId: z.uuid(), scope: z.literal('Course') }),
    z.object({ ...fields, organizationId: z.uuid(), scope: z.literal('Organization') })
]);
export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;

/** The scope and the place an announcement belongs to never change, so the schema rejects them outright. */
export const updateAnnouncementSchema = z
    .object({
        announcementId: z.uuid(),
        bodyHtml: fields.bodyHtml,
        pinned: z.boolean().optional(),
        title: fields.title
    })
    .strict();
export type UpdateAnnouncementInput = z.infer<typeof updateAnnouncementSchema>;

export const announcementIdSchema = z.object({ announcementId: z.uuid() });
export const publishAnnouncementSchema = announcementIdSchema.extend({ sendEmail: z.boolean().default(false) });
export const pinAnnouncementSchema = announcementIdSchema.extend({ pinned: z.boolean() });

/** `organizationId`: a UUID for one organization's feed, `null` for the platform feed. */
export const feedQuerySchema = z.object({
    cursor: z.string().max(500).optional(),
    organizationId: z.uuid().nullable().default(null)
});

export const announcementEmailPreferenceSchema = z.object({ enabled: z.boolean() });

/** An unread count for display: `99+` once it passes 99. */
export function formatUnreadCount(count: number): string {
    return count > 99 ? '99+' : String(Math.max(0, Math.trunc(count)));
}
