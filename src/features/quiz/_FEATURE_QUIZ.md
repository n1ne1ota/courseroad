# Quiz Feature

Quiz UI lives in `components/`, the highlighted-prompt hook in `hooks/`, and player animations in `utils/`.
Server actions and domain writes live in `actions/` and `mutations/`. Queries, schemas, shared types,
player types, and orchestrators stay at the feature root. Grading runs on the server.
Dashboard and route components compose quiz APIs; sibling product features do not import quiz internals.
