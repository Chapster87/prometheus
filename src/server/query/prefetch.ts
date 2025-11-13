/**
 * Server-side prefetch utilities for React Query hydration.
 * Builds a dehydrated state priming queries for initial render.
 *
 * Keep heavy data merging server-side before hydration to reduce client work.
 */
import { QueryClient, dehydrate } from "@tanstack/react-query"
import { getSeriesBatch, getSeries } from "@/server/series"

export async function prefetchSeriesBatch(categories: string[]) {
  const qc = new QueryClient()
  const batch = await getSeriesBatch(categories)
  // Prime individual category queries for granular cache access
  for (const c of categories) {
    qc.setQueryData(["series", c], batch[c])
  }
  // Also prime combined batch
  qc.setQueryData(["seriesBatch", [...categories].sort()], batch)
  return dehydrate(qc)
}

export async function prefetchSingleSeries(category: string) {
  const qc = new QueryClient()
  const data = await getSeries(category)
  qc.setQueryData(["series", category], data)
  return dehydrate(qc)
}
