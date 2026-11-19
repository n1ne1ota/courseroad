# Client State Management and Data Fetching

This guide covers client state, domain stores, and query hydration within the
[Courseroad Feature Architecture](./01_FEATURE_ARCHITECTURE.md). Server Components read through authorized feature DALs;
interactive browser reads use either Server Action read adapters (for uncached imperative fetches) or validated `GET`
endpoints (for TanStack Query caching, polling, or HTTP-addressable reads).

## Audience

Engineers adding interactive feature UI, client stores, or browser queries.

## State Matrix

| State Type               | Use Cases                                        | Primary Tool                                        |
| ------------------------ | ------------------------------------------------ | --------------------------------------------------- |
| Server state             | Initial page data and authorized reads           | Server Components and feature DALs                  |
| URL state                | Pagination, filters, and selected tabs           | `nuqs` and URL search parameters                    |
| Complex client state     | Builders and editor interaction                  | Zustand with a provider-owned store                 |
| Imperative browser reads | Uncached cursor pagination and tab-open checks   | Thin Server Actions (`createAuthAction` / `Tenant`) |
| Dynamic / cached reads   | Polling, background refetching, HTTP-cached data | TanStack Query and validated `GET` endpoints        |

Read initial data directly in a Server Component when no browser refetch is needed. Use a thin Server Action read when
an already-mounted client view fetches on demand without client cache/polling needs (e.g., loading the next feed page or
checking publish readiness). Add TanStack Query hydration when an interactive client needs cached, polled, or
URL-addressable reads.

## Zustand and SSR Safety

Client Components also render on the server. A mutable module-level store singleton can share state across requests. Use
the context-bound [createSSRStore helper](../../lib/store/create-ssr-store.tsx), whose provider creates one store
instance per render tree.

Domain stores belong in their feature, using `store/` when grouping is useful; generic factories stay in
`src/lib/store/`. See the [canonical folder rules](./01_FEATURE_ARCHITECTURE.md#standardized-directory-names).

### Existing Store

The [course curriculum store](../course/store/curriculum-store.ts) imports the shared factory and exposes its provider
and selector hook:

```typescript
"use client";

import { createSSRStore } from "@/lib/store/create-ssr-store";

export interface CurriculumState {
  expandedModuleIds: string[];
}

export interface CurriculumActions {
  collapseAll: () => void;
  expandAll: (ids: string[]) => void;
  toggleModule: (id: string) => void;
}

export type CurriculumStoreType = CurriculumState & CurriculumActions;

export const {
  Context: CurriculumStoreContext,
  Provider: CurriculumStoreProvider,
  useSSRStore: useCurriculumStore
} = createSSRStore<CurriculumStoreType>(set => ({
  collapseAll: () => set({ expandedModuleIds: [] }),
  expandAll: ids => set({ expandedModuleIds: ids }),
  expandedModuleIds: [],
  toggleModule: id =>
    set(state => ({
      expandedModuleIds: state.expandedModuleIds.includes(id)
        ? state.expandedModuleIds.filter(value => value !== id)
        : [...state.expandedModuleIds, id]
    }))
}));
```

### Consume the Store

This illustrative course component uses the existing store. Mount one provider around the editor subtree that should
share expansion state:

```tsx
"use client";

import { CurriculumStoreProvider, useCurriculumStore } from "@/features/course/store/curriculum-store";

function ModuleToggle({ moduleId }: { moduleId: string }) {
  const isExpanded = useCurriculumStore(state => state.expandedModuleIds.includes(moduleId));
  const toggleModule = useCurriculumStore(state => state.toggleModule);

  return (
    <button aria-expanded={isExpanded} onClick={() => toggleModule(moduleId)}>
      {isExpanded ? "Collapse module" : "Expand module"}
    </button>
  );
}

export function CurriculumExample({ moduleId }: { moduleId: string }) {
  return (
    <CurriculumStoreProvider initialValue={{ expandedModuleIds: [moduleId] }}>
      <ModuleToggle moduleId={moduleId} />
    </CurriculumStoreProvider>
  );
}
```

## TanStack Query and Server Hydration

Use the request-scoped [prefetchQuery helper](../../server/query/prefetch.ts) when a client query benefits from initial
server data. The server query and browser query must return the same shape and use the same key.

The following pair is an illustrative composition using the implemented [enrollment DAL](../course/server/enrollment.ts)
and [GET endpoint](../../app/api/courses/[courseId]/enrollment/route.ts). The component files shown here are examples to
create in course UI and server composition; the DAL and endpoint already exist. Render the server component within the
page's Suspense boundary, and use the app's existing query provider.

### Prefetch on the Server

Server composition calls the authorized DAL directly:

```tsx
import { HydrationBoundary } from "@tanstack/react-query";

import { getEnrollmentStatus } from "@/features/course/server/enrollment";
import { prefetchQuery } from "@/server/query/prefetch";

import { EnrollmentStatusClient } from "./enrollment-status-client";

export async function EnrollmentStatusSection({ courseId }: { courseId: string }) {
  const dehydratedState = await prefetchQuery(["course-enrollment", courseId], () => getEnrollmentStatus(courseId));

  return (
    <HydrationBoundary state={dehydratedState}>
      <EnrollmentStatusClient courseId={courseId} />
    </HydrationBoundary>
  );
}
```

### Refetch in the Browser

The existing private GET helper returns `{ data: ... }` on success and `{ error: ... }` on failure. Unwrap the success
envelope so the browser cache matches the server's result:

```tsx
"use client";

import { useQuery } from "@tanstack/react-query";

type EnrollmentStatus = {
  isEnrolled: boolean;
  learnHref: string;
};

async function fetchEnrollmentStatus(courseId: string): Promise<EnrollmentStatus> {
  const response = await fetch(`/api/courses/${encodeURIComponent(courseId)}/enrollment`, { cache: "no-store" });
  if (!response.ok) throw new Error("Unable to load enrollment status");

  const body: { data: EnrollmentStatus } = await response.json();
  return body.data;
}

export function EnrollmentStatusClient({ courseId }: { courseId: string }) {
  const { data, isPending, isError } = useQuery({
    queryKey: ["course-enrollment", courseId],
    queryFn: () => fetchEnrollmentStatus(courseId)
  });

  if (isPending) return <p>Loading enrollment...</p>;
  if (isError) return <p>Unable to load enrollment status.</p>;
  return <p>{data.isEnrolled ? "Enrolled" : "Not enrolled"}</p>;
}
```

The DAL validates the course identifier, resolves the current caller, and verifies organization access when applicable.
The endpoint repeats those checks on every browser request and sets `Cache-Control: private, no-store`. This HTTP policy
is separate from TanStack Query's in-memory browser cache.

## Failure Modes and Recovery

- **Hook outside its store provider:** The store helper throws. Mount the matching feature provider around consumers.
- **Mismatched query keys or result shapes:** Hydration misses or consumers receive unexpected data. Keep server and
  browser keys identical and unwrap transport envelopes before caching.
- **Prefetch failure:** The helper omits failed data; the browser query retries through the endpoint. Handle its loading
  and error states. Use a direct DAL/page adapter when access failure must navigate before rendering.
- **Private data across contexts:** Include resource selectors in query keys, including organization slugs for
  URL-scoped operations. When adding persistent private client queries, ensure their cache is cleared or remounted when
  identity changes; browser caching never replaces server authorization.
- **Unnecessary state duplication:** Keep pagination and sorting in the URL and use direct DAL reads for static
  presentation.

Server Actions adapt browser mutations and uncached imperative reads; TanStack Query reads, auth, uploads, payments, and
webhooks retain their HTTP boundaries. Existing public caches keep their policies, and session/organization memoization
is request-scoped. See [Server Data Access](./03_SERVER_DATA_ACCESS.md) for the complete transport and authorization
rules.
