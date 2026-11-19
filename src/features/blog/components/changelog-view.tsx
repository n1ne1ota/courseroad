import { ChangelogEntry } from '@courseroad/iota-ui/blocks';

import { formatDate } from '../schemas/shared-schemas';
import { getPublishedChangelog } from '../server/loaders/cached-content';
import { loadChangelogBody } from '../server/mdx';
import { BlogShell } from './blog-shell';

import type { ChangelogEntry as ChangelogEntryData } from '../types/content-types';

/** Groups entries (already newest first) by calendar month, keeping their order. */
export function groupByMonth(entries: readonly ChangelogEntryData[]) {
  const groups: { entries: ChangelogEntryData[]; label: string; month: string }[] = [];

  for (const entry of entries) {
    const month = entry.date.slice(0, 7);
    const last = groups.at(-1);

    if (last?.month === month) {
      last.entries.push(entry);
    } else {
      const label = new Intl.DateTimeFormat('en', { month: 'long', timeZone: 'UTC', year: 'numeric' }).format(
        new Date(`${entry.date}T00:00:00Z`)
      );
      groups.push({ entries: [entry], label, month });
    }
  }

  return groups;
}

async function EntryBody({ id }: { id: string }) {
  const Body = await loadChangelogBody(id);
  return <Body />;
}

/** `/changelog`: every published entry, newest first, grouped by month. */
export async function ChangelogView() {
  const entries = await getPublishedChangelog();

  return (
    <BlogShell description='What is new in Courseroad, for learners, creators and organizations.' title='Changelog'>
      {entries.length === 0 ? (
        <p className='text-muted-foreground'>Nothing here yet.</p>
      ) : (
        groupByMonth(entries).map(group => (
          <section key={group.month} className='mb-12 last:mb-0' aria-labelledby={`month-${group.month}`}>
            <h2
              className='mb-2 text-sm font-semibold tracking-wide text-muted-foreground uppercase'
              id={`month-${group.month}`}
            >
              {group.label}
            </h2>
            {group.entries.map(entry => (
              <ChangelogEntry
                key={entry.id}
                id={entry.id}
                audience={entry.audience}
                date={{ dateTime: entry.date, label: formatDate(entry.date) }}
                kind={entry.kind}
                title={entry.title}
              >
                <EntryBody id={entry.id} />
              </ChangelogEntry>
            ))}
          </section>
        ))
      )}
    </BlogShell>
  );
}
