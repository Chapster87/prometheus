import { ReactQueryProvider } from "@/client/query/Provider"
import { getSeriesInfoRaw, getSeriesInfo } from "@/server/series"
import { getTmdbSeriesInfo } from "@/server/tmdb"
import type { DehydratedState } from "@tanstack/react-query"
import { QueryClient, dehydrate } from "@tanstack/react-query"
import SeriesClient from "./detail.client"
import { SeriesDetails } from "@/types/series"
import { notFound } from "next/navigation"
import s from "./styles.module.css"

const SIZE_LIMIT_BYTES = 1.8 * 1024 * 1024

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
export default async function SeriesInfo({
  params,
}: {
  params: Promise<CategoryParams>
}) {
  const resolved = await params
  const seriesId = resolved?.id ? resolved.id.trim() : null
  if (!seriesId) {
    console.warn("Missing series id; returning 404")
    notFound()
  }

  let dehydrated: DehydratedState | null = null
  let tmdbIdForClient: string | null = null

  try {
    // Probe size (avoid unstable_cache during decision).
    const probe = await getSeriesInfoRaw(seriesId)
    const sizeEstimate = Buffer.byteLength(JSON.stringify(probe))

    if (sizeEstimate < SIZE_LIMIT_BYTES) {
      // Populate incremental cache (if not skipped) with a second fetch (fast).
      const cachedData = await getSeriesInfo(seriesId)

      const qc = new QueryClient()
      qc.setQueryData(["seriesInfo", seriesId], cachedData)

      // Derive TMDB id from XC payload (string). XC payload structure assumed: cachedData.info.tmdb
      const tmdbCredsAvailable = !!(
        process.env.TMDB_API_READ_ACCESS_TOKEN || process.env.TMDB_API_KEY
      )
      const tmdbId =
        typeof (cachedData as SeriesDetails)?.info?.tmdb === "string"
          ? (cachedData as SeriesDetails).info.tmdb.trim()
          : null
      if (tmdbId && tmdbCredsAvailable) {
        try {
          const tmdbData = await getTmdbSeriesInfo(tmdbId)
          qc.setQueryData(["tmdbSeriesInfo", tmdbId], tmdbData)
          tmdbIdForClient = tmdbId
        } catch (e) {
          console.warn("TMDB prefetch failed; skipping hydration", e)
        }
      }

      dehydrated = dehydrate(qc)
    } else {
      console.warn(
        `Prefetch size ${sizeEstimate} >= ${SIZE_LIMIT_BYTES}; skip hydration for ${seriesId}`
      )
    }
  } catch (e) {
    console.error("Prefetch probe failed; fallback to client fetch", e)
  }

  return (
    <div className={`page`}>
      <main className={`main`}>
        <ReactQueryProvider initialState={dehydrated}>
          <SeriesClient
            seriesId={seriesId}
            tmdbId={tmdbIdForClient || undefined}
          />
        </ReactQueryProvider>
      </main>
    </div>
  )
}
