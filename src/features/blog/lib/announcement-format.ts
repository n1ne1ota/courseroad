/** A publication date for display. UTC, so the server and the browser always agree. */
export function formatAnnouncementDate(iso: string | null): string {
    if (!iso) return '';
    return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(iso));
}
