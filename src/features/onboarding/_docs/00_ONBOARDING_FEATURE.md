# Onboarding Feature

Onboarding owns the new-user wizard, creator and learner profile steps, organization setup, team-invitation progress,
and onboarding completion. Its UI lives in `components/`, browser-safe validation in `schemas/`, and setup progress in
`hooks/`.

## Entry Points and Boundaries

- [Onboarding entry](../server/entry.ts) verifies the session and reads memberships before selecting the wizard,
  organization selection, or an existing dashboard. Rendering does not create an organization or complete onboarding.
- [Wizard](../components/onboarding-wizard.tsx) composes the onboarding paths.
  [Organization setup](../hooks/use-organization-setup.ts) creates the organization through Better Auth, verifies owner
  membership, activates it, completes the account's onboarding, and reports individual invitation outcomes. Retries
  retain completed work within the mounted wizard; failed invitations require explicit retry.
- [Completion action](../actions/actions.ts) delegates creator/learner completion to the authorized
  [server workflow](../server/workflows/actions.ts). Its validation contract belongs to onboarding.

Organization owns ongoing membership administration and invitation acceptance; auth owns account security. Compose other
features through routes or dashboard, following [Feature Architecture](../../_docs/01_FEATURE_ARCHITECTURE.md) and
[Server Data Access](../../_docs/03_SERVER_DATA_ACCESS.md).
