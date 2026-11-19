/**
 * Layout classes shared by the public course card, the catalog grid, and their skeleton.
 * Only structure lives here; hover, focus, and motion stay on the real card.
 */

/** Public catalog grid (up to 3 columns inside `PublicPageShell`). */
export const courseCatalogGridClass = 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3';

/** Structural frame shared between `CourseCard` and `CourseCardSkeleton`. */
export const courseCardClass = 'relative h-full';
