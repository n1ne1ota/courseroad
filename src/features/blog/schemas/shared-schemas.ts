import { z } from 'zod';

/** A calendar date, `YYYY-MM-DD`. YAML turns an unquoted date into a `Date`, so that is accepted and normalized. */
export const calendarDate = z.preprocess(
    value => (value instanceof Date ? value.toISOString().slice(0, 10) : value),
    z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use a calendar date, YYYY-MM-DD')
        .refine(value => new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value, 'Not a real date')
);

/** A content slug: the filename without its extension (and without the date prefix for changelog entries). */
export const SLUG_PATTERN = /^[a-z0-9-]+$/;

/** Dates are calendar dates in UTC; this is the date "today" for the publishing rule. */
export function todayUtc(now: Date = new Date()): string {
    return now.toISOString().slice(0, 10);
}

/** Whether an entry is public: not a draft, and dated on or before today in UTC. */
export function isPublished(entry: { date: string; draft?: boolean | undefined }, today: string = todayUtc()): boolean {
    return entry.draft !== true && entry.date <= today;
}

/** Formats a calendar date for display, in English, as a long date, in UTC. */
export function formatDate(date: string): string {
    return new Intl.DateTimeFormat('en', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`));
}
