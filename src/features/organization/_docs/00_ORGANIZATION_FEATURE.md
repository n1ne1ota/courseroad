# Organization Feature

Organization owns workspace creation and selection, membership administration, organization settings, and invitation
acceptance. UI lives in `components/`, authorized view reads in `server/loaders/`, and invitation operations in
`server/invitations.ts`. Browser-safe types and invitation contracts stay outside `server/`.

## Entry Points and Boundaries

- [Selection loader](../server/loaders/select-organization.ts) and
  [creation loader](../server/loaders/create-organization.ts) prepare workspace entry views.
- [Settings loader](../server/loaders/organization-settings-view.ts) and
  [members loader](../server/loaders/organization-members-view.ts) verify the URL-selected organization and required
  access independently of layouts.
- [Invitation actions](../actions/invitation-actions.ts) adapt the authorized
  [invitation operations](../server/invitations.ts). Reading an invitation does not accept it. Explicit acceptance
  verifies the recipient and resulting membership; retries can recover an already accepted invitation before completing
  onboarding and activating its organization.

Onboarding owns the initial workspace-setup wizard. Auth owns account security, and payment owns Stripe Connect
operations. Dashboard supplies their composed UI where needed. Organization selectors and active-organization
preferences do not establish authorization; follow [Feature Architecture](../../_docs/01_FEATURE_ARCHITECTURE.md) and
[Server Data Access](../../_docs/03_SERVER_DATA_ACCESS.md).
