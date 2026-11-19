/**
 * Layout classes shared by dashboard sections and their skeletons.
 *
 * A section and its skeleton import the same constant, so a layout change
 * (columns, gap, card radius) can't leave the skeleton describing an old UI.
 * Only structural classes live here; hover, focus, and motion stay on the real component.
 */

/** Course card grid (My Learning, Trending Courses). */
export const courseGridClass = 'grid grid-cols-1 gap-grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';

/**
 * Recommendations shown in Trending Courses; its skeleton renders the same count.
 * Lives here, not in the 'use client' carousel, so server components receive the real value.
 */
export const CATALOG_PREVIEW_COUNT = 4;

/** Workspace card grid (My Workspaces). */
export const workspaceGridClass = 'grid grid-cols-1 gap-grid sm:grid-cols-2 lg:grid-cols-3';

/** Grid for plain list cards inside a content panel (creator courses and quizzes). */
export const listCardGridClass = 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3';

/** Frame of a plain list card; hover and link behavior stay with the real card. */
export const listCardClass = 'flex flex-col justify-between rounded-lg border p-6';

/** Stats row of three compact cards (learner dashboard). */
export const statsGridClass = 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3';

/** Compact stat card frame; hover and entry motion stay with the real card. */
export const statCardClass =
    'border-default-200/50 relative flex items-center gap-4 overflow-hidden rounded-2xl border bg-background/50 p-6 shadow-sm backdrop-blur-md';

/** Large metric card (creator overview). */
export const metricCardClass =
    'border-default-200/50 relative overflow-hidden rounded-3xl border bg-background/40 p-6 shadow-sm backdrop-blur-md';

/** Large chart panel (creator overview sales history). */
export const chartPanelClass =
    'border-default-200/50 rounded-3xl border bg-background/40 p-6 shadow-sm backdrop-blur-md';

/** Table or list panel with a titled header strip (billing history). */
export const historyPanelClass =
    'border-default-200/50 overflow-hidden rounded-3xl border bg-background/30 shadow-sm backdrop-blur-md';

/** Header strip of a `historyPanelClass` panel. */
export const historyPanelHeaderClass = 'border-default-200/50 border-b bg-muted/20 px-6 py-5';

/** Months plotted in the creator sales chart; its skeleton draws the same number of bars. */
export const SALES_CHART_BAR_COUNT = 12;

/** Frosted card surface used by course and workspace cards. */
export const glassCardClass =
    'border-default-200/50 relative flex flex-col overflow-hidden rounded-2xl border bg-background/40 shadow-sm backdrop-blur-md';

/** Page hero panel at the top of a dashboard. */
export const heroPanelClass =
    'border-default-200/50 relative flex flex-col justify-between gap-6 overflow-hidden rounded-3xl border bg-background/40 p-8 shadow-sm backdrop-blur-md md:flex-row md:items-center';
