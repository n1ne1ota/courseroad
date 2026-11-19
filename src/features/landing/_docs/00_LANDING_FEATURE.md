# Landing Feature

Landing owns the public homepage hero and shared landing background presentation. Its modules stay flat at the feature
root: `hero.tsx`, `hero-button.tsx`, `hero-buttons.tsx`, `auth-buttons.tsx`, and `landing-background.tsx`.

Routes under `app/(public)/` compose `Hero` on the home page and mount `LandingBackground` in the `(public)` layout so
the interactive WebGL pixel background persists across `/`, `/courses`, `/courses/[courseId]`, `/blog`, `/blog/[slug]`,
`/changelog`, `/pricing`, `/about`, `/contact`, and `/unsubscribe/*`.

See [Feature Architecture](../../_docs/01_FEATURE_ARCHITECTURE.md) and
[Client State and Fetching](../../_docs/02_CLIENT_STATE_FETCHING.md) for the canonical structure and client-boundary
rules.
