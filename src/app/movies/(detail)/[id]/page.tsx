import { ReactQueryProvider } from "@/client/query/Provider"
import { getMovieInfoRaw, getMovieInfo } from "@/server/movies"
import { getTmdbMovieInfo } from "@/server/tmdb"
import type { DehydratedState } from "@tanstack/react-query"
import { QueryClient, dehydrate } from "@tanstack/react-query"
import MovieClient from "./detail.client"
import { MovieDetails } from "@/types/movies"
import { notFound } from "next/navigation"
import s from "./styles.module.css"

const SIZE_LIMIT_BYTES = 1.8 * 1024 * 1024

/**
 * Dynamic category page with size-gated hydration.
 * 1. Probe size via getMovieRaw (inner cache only).
 * 2. If under threshold, fetch again via getMovie to populate incremental cache (fast due to inner cache).
 * 3. Manually build dehydrated state priming both query keys used by client hooks:
 *    - ["movie", categoryId]
 *    - ["movieBatch", [categoryId].sort()]
 * Large payloads skip hydration to reduce response size and avoid edge cache limits.
 */

type CategoryParams = { id?: string; status?: string; value?: string }
export default async function MovieInfo({
  params,
}: {
  params: Promise<CategoryParams>
}) {
  const resolved = await params
  const movieId = resolved?.id ? resolved.id.trim() : null
  if (!movieId) {
    console.warn("Missing movie id; returning 404")
    notFound()
  }

  let dehydrated: DehydratedState | null = null
  let tmdbIdForClient: string | null = null

  try {
    // Probe size (avoid unstable_cache during decision).
    const probe = await getMovieInfoRaw(movieId)
    const sizeEstimate = Buffer.byteLength(JSON.stringify(probe))

    if (sizeEstimate < SIZE_LIMIT_BYTES) {
      // Populate incremental cache (if not skipped) with a second fetch (fast).
      const cachedData = await getMovieInfo(movieId)

      const qc = new QueryClient()
      qc.setQueryData(["movieInfo", movieId], cachedData)

      // Derive TMDB id from XC payload (string). XC payload structure assumed: cachedData.info.tmdb_id
      const tmdbCredsAvailable = !!(
        process.env.TMDB_API_READ_ACCESS_TOKEN || process.env.TMDB_API_KEY
      )
      const tmdbId =
        typeof (cachedData as MovieDetails)?.info?.tmdb_id === "number"
          ? String((cachedData as MovieDetails).info.tmdb_id).trim()
          : null
      if (tmdbId && tmdbCredsAvailable) {
        try {
          const tmdbData = await getTmdbMovieInfo(tmdbId)
          qc.setQueryData(["tmdbMovieInfo", tmdbId], tmdbData)
          tmdbIdForClient = tmdbId
        } catch (e) {
          console.warn("TMDB prefetch failed; skipping hydration", e)
        }
      }

      dehydrated = dehydrate(qc)
    } else {
      console.warn(
        `Prefetch size ${sizeEstimate} >= ${SIZE_LIMIT_BYTES}; skip hydration for ${movieId}`
      )
    }
  } catch (e) {
    console.error("Prefetch probe failed; fallback to client fetch", e)
  }

  return (
    <div className={`page`}>
      <main className={`main`}>
        <ReactQueryProvider initialState={dehydrated}>
          <MovieClient
            movieId={movieId}
            tmdbId={tmdbIdForClient || undefined}
          />
        </ReactQueryProvider>
      </main>
    </div>
  )
}
