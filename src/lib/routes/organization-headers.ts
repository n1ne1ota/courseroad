import { extractOrgSlug } from './org';

/** Carry this tab's URL organization to HTTP requests; the server verifies membership. */
export function organizationRequestHeaders(): Record<string, string> {
    if (typeof window === 'undefined') return {};
    const slug = extractOrgSlug(window.location.pathname);
    return slug ? { 'x-organization-slug': slug } : {};
}
