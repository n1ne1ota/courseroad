import 'server-only';

import { cache } from 'react';

import { dehydrate, QueryClient } from '@tanstack/react-query';

/**
 * Creates a request-scoped QueryClient instance.
 * React's cache() wrapper guarantees that multiple calls inside the same render request
 * will share the same QueryClient, while concurrent requests remain isolated.
 */
export const getQueryClient = cache(
    () =>
        new QueryClient({
            defaultOptions: {
                queries: {
                    gcTime: 5 * 60 * 1000, // 5 minutes
                    staleTime: 60 * 1000 // 1 minute
                }
            }
        })
);

/**
 * Prefetches a query on the server and returns the dehydrated state.
 *
 * @param queryKey The query cache key.
 * @param queryFn The async data fetcher.
 * @returns The dehydrated QueryClient state.
 */
export async function prefetchQuery(queryKey: unknown[], queryFn: () => Promise<unknown>) {
    const queryClient = getQueryClient();
    await queryClient
        .query({
            queryFn,
            queryKey
        })
        // Prefetch failures are retried when the client requests the query.
        .catch(() => undefined);
    return dehydrate(queryClient);
}
