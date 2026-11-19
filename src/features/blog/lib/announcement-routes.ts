/** Where a learner opens an announcement: the platform learner dashboard, or the organization's learner dashboard. */
export function announcementPath({
    id,
    organizationSlug
}: {
    id: string;
    organizationSlug?: string | null | undefined;
}): string {
    const base = organizationSlug
        ? `/organization/${encodeURIComponent(organizationSlug)}/learner/dashboard`
        : '/learner/dashboard';
    return `${base}/announcements/${encodeURIComponent(id)}`;
}

/** The learner's feed, platform or organization. */
export function announcementFeedPath(organizationSlug?: string | null): string {
    return organizationSlug
        ? `/organization/${encodeURIComponent(organizationSlug)}/learner/dashboard/announcements`
        : '/learner/dashboard/announcements';
}

/** Public unsubscribe page that an email links to, and the one-click endpoint its `List-Unsubscribe` header names. */
export const UNSUBSCRIBE_PAGE_PATH = '/unsubscribe/announcements';
export const UNSUBSCRIBE_API_PATH = '/api/unsubscribe/announcements';
