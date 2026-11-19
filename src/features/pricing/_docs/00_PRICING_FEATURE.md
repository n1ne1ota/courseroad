# Pricing Feature

Pricing owns the public pricing comparison section, tier definitions, and feature-matrix configuration. Its modules stay
flat at the feature root: `pricing-section.tsx`, `pricing-tiers.ts`, `pricing-tiers-features.ts`, `pricing-types.ts`,
and `pricing-comparison-types.ts`.

`app/(public)/pricing/page.tsx` composes `PricingSection`, which builds on Iota's `PricingComparison` block inside
`PublicPageShell` (`framed={false}`) for footer alignment. Checkout and billing workflows remain owned by
[Payment](../../payment/_docs/00_PAYMENT_FEATURE.md).

See [Feature Architecture](../../_docs/01_FEATURE_ARCHITECTURE.md) and
[Client State and Fetching](../../_docs/02_CLIENT_STATE_FETCHING.md) for the canonical structure and composition rules.
