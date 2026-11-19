export interface AnnouncementSummary {
    authorName: string | null;
    courseTitle: string | null;
    excerpt: string;
    id: string;
    organizationName: string | null;
    pinned: boolean;
    publishedAt: string | null;
    read: boolean;
    scope: 'Course' | 'Organization';
    title: string;
}

export interface AnnouncementDetail extends AnnouncementSummary {
    /** Sanitized on every read. */
    bodyHtml: string;
}

export interface AuthoredAnnouncement extends AnnouncementDetail {
    emailRecipientCount: number | null;
    emailStatus: 'None' | 'Sent' | 'Partial' | 'Failed';
    status: 'Draft' | 'Published';
    updatedAt: string;
}
