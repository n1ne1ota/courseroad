# Challenge Feature

Challenge owns coding challenge data. Its current implementation contains internal persistence queries and types in
`server/db/`; `coding-challenges.tsx` is an empty placeholder.

A populated directory does not establish a complete challenge experience. Add authorized server entry points before
wiring consumers to persistence; routes and dashboard must not import internal database modules.

See [Feature Architecture](../../_docs/01_FEATURE_ARCHITECTURE.md) and
[Server Data Access](../../_docs/03_SERVER_DATA_ACCESS.md) for the canonical ownership and authorization rules.
