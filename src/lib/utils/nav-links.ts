/**
 * Whether `href` is the current page or one of its ancestors, so `/courses` stays active on `/courses/abc`.
 * The match is by whole path segment: `/blog` does not match `/blogging`.
 */
export function isNavLinkActive(pathname: string | null, href: string): boolean {
    if (!pathname) return false;
    if (pathname === href) return true;

    return href !== '/' && pathname.startsWith(`${href}/`);
}
