import 'server-only';

import DOMPurify from 'isomorphic-dompurify';

import { sanitizeHtml } from '@/lib/utils/sanitize';

/**
 * Announcement bodies come from the Iota editor, which has no image control in v1, so images are removed as well as
 * scripts, event handlers and `javascript:` links. Applied when a body is written and again when it is read, because
 * the Iota `HtmlContent` renderer does not sanitize.
 */
export function sanitizeAnnouncementHtml(html: string): string {
    return DOMPurify.sanitize(sanitizeHtml(html), { FORBID_TAGS: ['img'] });
}

/** Text content with the markup removed, used to reject a message that is only empty paragraphs. */
export function plainText(html: string): string {
    return html
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}
