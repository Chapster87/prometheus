"use client"

import {
  QueryClient,
  QueryClientProvider,
  HydrationBoundary,
} from "@tanstack/react-query"
import type { DehydratedState } from "@tanstack/react-query"
import { useState } from "react"

/**
 * React Query Provider with sensible defaults for read-heavy caching.
 * Pass `initialData` produced on the server (via dehydrate) for hydration.
 */
export function ReactQueryProvider({
  children,
  initialState,
}: {
  children: React.ReactNode
  initialState: DehydratedState | null | undefined
}) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 min
            gcTime: 30 * 60 * 1000, // 30 min
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={client}>
      <HydrationBoundary state={initialState}>{children}</HydrationBoundary>
    </QueryClientProvider>
  )
}
