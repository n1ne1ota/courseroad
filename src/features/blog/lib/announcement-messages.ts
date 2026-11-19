/** What publishing decided about email, as the publish action reports it. Never carries addresses. */
export type PublishEmailOutcome =
    | { outcome: 'not-requested' }
    | { cap: number; outcome: 'disabled' }
    | { cap: number; outcome: 'over-cap'; recipientCount: number }
    | { limit: number; outcome: 'rate-limited' }
    | { outcome: 'no-recipients' }
    | { outcome: 'send'; recipientCount: number };

const people = (count: number) => `${count} ${count === 1 ? 'person' : 'people'}`;

/** The sentence shown to the author after publishing: it says plainly whether any email is going out and why not. */
export function describePublishOutcome(email: PublishEmailOutcome | null): string {
    if (!email || email.outcome === 'not-requested') return 'Published.';

    switch (email.outcome) {
        case 'send':
            return `Published. Emailing ${people(email.recipientCount)}.`;
        case 'disabled':
            return 'Published in the app. Email is turned off, so nothing was sent.';
        case 'over-cap':
            return `Published in the app only. Emailing ${people(email.recipientCount)} is over the limit of ${email.cap}, so nothing was sent.`;
        case 'rate-limited':
            return `Published in the app only. At most ${email.limit} announcements can be emailed in 24 hours, so nothing was sent.`;
        case 'no-recipients':
            return 'Published. No one in the audience has announcement email turned on, so nothing was sent.';
    }
}
