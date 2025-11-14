import { ReactQueryProvider } from "@/client/query/Provider"
import { getSeriesRaw, getSeries } from "@/server/series"
import type { DehydratedState } from "@tanstack/react-query"
import { QueryClient, dehydrate } from "@tanstack/react-query"
import SeriesClient from "./category.client"
import { notFound } from "next/navigation"
import s from "./styles.module.css"

const SIZE_LIMIT_BYTES = 1.8 * 1024 * 1024

// # Fully dynamic: no static params; category IDs resolved at runtime.

/**
 * Dynamic category page with size-gated hydration.
 * 1. Probe size via getSeriesRaw (inner cache only).
 * 2. If under threshold, fetch again via getSeries to populate incremental cache (fast due to inner cache).
 * 3. Manually build dehydrated state priming both query keys used by client hooks:
 *    - ["series", categoryId]
 *    - ["seriesBatch", [categoryId].sort()]
 * Large payloads skip hydration to reduce response size and avoid edge cache limits.
 */

type CategoryParams = { id?: string; status?: string; value?: string }
export default async function Series({
  params,
}: {
  params: Promise<CategoryParams>
}) {
  const resolvedParams = await params

  const categoryId = resolvedParams?.id ? resolvedParams.id.trim() : null
  if (!categoryId) {
    console.warn("Missing category id; returning 404")
    notFound()
  }

  const categories = [categoryId]

  let dehydrated: DehydratedState | null = null

  try {
    // Probe size (avoid unstable_cache during decision).
    const probe = await getSeriesRaw(categoryId)
    const sizeEstimate = Buffer.byteLength(JSON.stringify(probe))

    if (sizeEstimate < SIZE_LIMIT_BYTES) {
      // Populate incremental cache (if not skipped) with a second fetch (fast).
      const cachedData = await getSeries(categoryId)

      const qc = new QueryClient()
      qc.setQueryData(["series", categoryId], cachedData)
      qc.setQueryData(["seriesBatch", [categoryId].sort()], cachedData)
      dehydrated = dehydrate(qc)
    } else {
      console.warn(
        `Prefetch size ${sizeEstimate} >= ${SIZE_LIMIT_BYTES}; skip hydration for ${categoryId}`
      )
    }
  } catch (e) {
    console.error("Prefetch probe failed; fallback to client fetch", e)
  }

  return (
    <div className={`page`}>
      <main className={`main`}>
        <ReactQueryProvider initialState={dehydrated}>
          <SeriesClient categories={categories} />
        </ReactQueryProvider>
      </main>
    </div>
  )
}
