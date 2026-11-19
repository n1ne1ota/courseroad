# Payment Feature

Payment owns checkout, payment intents, receipts, creator earnings, Stripe Connect operations, and payment HTTP
handlers. UI lives in `components/`, authorized view reads in `server/loaders/`, business operations in
`server/workflows/`, and HTTP implementations in `server/http/`. Browser-safe result types stay in `types/`.

## Entry Points and Boundaries

- [Checkout wrapper](../components/payment-checkout-wrapper.tsx) composes checkout UI; the
  [checkout loader](../server/loaders/public-courses-course-checkout.ts) prepares its server data.
- [Payment-intent actions](../actions/payment-intent-actions.ts) and [creator actions](../actions/creator-actions.ts)
  delegate mutations to feature-owned workflows.
- [Creator earnings](../server/loaders/platform-creator-earnings.ts),
  [learner billing](../server/loaders/platform-learner-billing.ts), and [receipts](../server/receipts.ts) own their
  authorized data projections.
- [Stripe Connect](../server/stripe-connect.ts) configures feature operations using the shared server SDK and logging.
  [Payment HTTP handlers](../server/http/payments/) own checkout, Connect, and webhook behavior; `app/api/` route
  adapters register the endpoints.

Dashboard composes payment views; organization settings may display a Connect card without owning payment policy. Keep
SDK clients and secrets private, preserve webhook verification and retry behavior, and verify each caller and resource
independently of layouts. See [Feature Architecture](../../_docs/01_FEATURE_ARCHITECTURE.md) and
[Server Data Access](../../_docs/03_SERVER_DATA_ACCESS.md).
