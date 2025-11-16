/**
 * TMDB server-side access & caching layer.
 *
 * Pattern mirrors series.ts:
 *  - External fetch (no-store) with bearer token or api_key param.
 *  - Inner process cache via getCache().
 *  - Optional Next.js incremental cache via unstable_cache.
 *
 * Environment Variables:
 *  - TMDB_API_READ_ACCESS_TOKEN (preferred; v4 bearer)
 *  - TMDB_API_KEY (fallback; v3 key)
 *  - CACHE_TTL_SECONDS (shared TTL)
 *  - TMDB_DISABLE_INCREMENTAL_CACHE=true (skip unstable_cache globally)
 *  - TMDB_CACHE_SKIP=123,456 (comma list of ids to skip incremental cache)
 */

import { unstable_cache } from "next/cache"
import { getCache, buildKey } from "@/server/cache"
import { TmdbLite } from "@/types/tmdbLite"

const TMDB_BASE_URL = "https://api.themoviedb.org/3"
const bearer = process.env.TMDB_API_READ_ACCESS_TOKEN
const apiKey = process.env.TMDB_API_KEY

if (!bearer && !apiKey) {
  console.warn(
    "TMDB credentials missing (TMDB_API_READ_ACCESS_TOKEN / TMDB_API_KEY)"
  )
}

function ttl(): number {
  const raw = process.env.CACHE_TTL_SECONDS
  const n = raw ? parseInt(raw, 10) : 300
  return Number.isFinite(n) && n > 0 ? n : 300
}

const SKIP_LIST = (process.env.TMDB_CACHE_SKIP || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean)

function shouldSkipIncremental(id: string): boolean {
  if (process.env.TMDB_DISABLE_INCREMENTAL_CACHE === "true") return true
  return SKIP_LIST.includes(id)
}

type QueryParams = Record<string, string | number | boolean | undefined>

/**
 * Generic TMDB media shape (subset + enriched fields).
 */
export interface TmdbMedia {
  id?: number
  name?: string
  title?: string
  overview?: string
  genres?: { id: number; name: string }[]
  backdrop_path?: string
  poster_path?: string
  first_air_date?: string
  release_date?: string
  number_of_seasons?: number
  number_of_episodes?: number
  vote_average?: number
  content_ratings?: {
    results: { iso_3166_1: string; rating: string | null }[]
  }
  release_dates?: {
    results?: {
      iso_3166_1: string
      release_dates: { certification: string | null }[]
    }[]
  }
  watch_providers?: unknown
  videos?: { results: { key: string; site: string; type: string }[] }
  images?: { backdrops?: unknown[]; posters?: unknown[] }
  seasons?: { season_number: number; episodes?: Record<string, unknown>[] }[]
  trailers?: { key: string; site: string; type: string }[]
  certification_rating?: string | null
  media_type?: string
  episodes?: Record<string, unknown>[]
}

/**
 * Build query string.
 */
function buildQuery(params: QueryParams): string {
  const qp = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(
      ([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`
    )
  return qp.join("&")
}

/**
 * Low-level TMDB fetch with auth fallback.
 */
async function tmdbFetch<T>(path: string, query: QueryParams = {}): Promise<T> {
  if (!bearer && !apiKey) {
    throw new Error(
      "Missing TMDB credentials (TMDB_API_READ_ACCESS_TOKEN or TMDB_API_KEY)"
    )
  }

  const mergedQuery = { ...query }
  if (!bearer && apiKey) {
    mergedQuery.api_key = apiKey
  }

  const url =
    Object.keys(mergedQuery).length > 0
      ? `${TMDB_BASE_URL}${path}?${buildQuery(mergedQuery)}`
      : `${TMDB_BASE_URL}${path}`

  const res = await fetch(url, {
    cache: "no-store",
    headers: bearer
      ? {
          Accept: "application/json",
          Authorization: `Bearer ${bearer}`,
        }
      : { Accept: "application/json" },
  })

  if (!res.ok) {
    throw new Error(`TMDB error ${res.status} for ${url}`)
  }
  return (await res.json()) as T
}

/* --------------------------------------------------------------------------
 * MOVIE FETCHES (ported from old Spark)
 * -------------------------------------------------------------------------- */

/**
 * Fetch single movie with appended resources.
 */
export async function fetchTmdbMovieExternal(
  tmdbId: string
): Promise<TmdbMedia> {
  const movie = await tmdbFetch<TmdbMedia>(`/movie/${tmdbId}`, {
    append_to_response: "release_dates,watch/providers,videos,images",
    language: "en-US",
  })
  return enrichMovie(movie)
}

/**
 * Batch fetch movies.
 */
export async function fetchTmdbMoviesGroupExternal(
  ids: (string | number)[]
): Promise<TmdbMedia[]> {
  const results: TmdbMedia[] = []
  for (const id of ids) {
    try {
      const m = await fetchTmdbMovieExternal(String(id))
      results.push(m)
    } catch (e) {
      console.warn("Failed movie fetch", id, e)
    }
  }
  return results
}

/**
 * Movie genres list.
 */
export async function fetchTmdbMovieGenresExternal(): Promise<
  { id: number; name: string }[]
> {
  const data = await tmdbFetch<{ genres: { id: number; name: string }[] }>(
    "/genre/movie/list",
    { language: "en-US" }
  )
  return data.genres || []
}

/**
 * Discover movies by genre IDs (comma separated).
 */
export async function fetchTmdbMoviesByGenresExternal(
  genreIds: string,
  page: number = 1
) {
  return tmdbFetch<Record<string, unknown>>("/discover/movie", {
    include_adult: false,
    include_video: false,
    language: "en-US",
    page,
    sort_by: "popularity.desc",
    with_genres: genreIds,
    with_original_language: "en",
  })
}

/**
 * Trending movies (week).
 */
export async function fetchTrendingMoviesExternal(): Promise<TmdbMedia[]> {
  const trending = await tmdbFetch<{ results: { id: number }[] }>(
    "/trending/movie/week",
    { language: "en-US" }
  )
  const ids = trending.results?.map((r) => r.id) || []
  return fetchTmdbMoviesGroupExternal(ids)
}

/* --------------------------------------------------------------------------
 * TV / SERIES FETCHES (existing + ported enrichment)
 * -------------------------------------------------------------------------- */

/**
 * Fetch single TV show (series) with appended resources and enrichment.
 */
export async function fetchTmdbShowExternal(
  tmdbId: string
): Promise<TmdbMedia> {
  const show = await tmdbFetch<TmdbMedia>(`/tv/${tmdbId}`, {
    append_to_response: "content_ratings,watch/providers,videos,images",
    language: "en-US",
  })
  return enrichShow(show)
}

/**
 * Batch fetch shows.
 */
export async function fetchTmdbShowsGroupExternal(
  ids: (string | number)[]
): Promise<TmdbMedia[]> {
  const results: TmdbMedia[] = []
  for (const id of ids) {
    try {
      const s = await fetchTmdbShowExternal(String(id))
      results.push(s)
    } catch (e) {
      console.warn("Failed show fetch", id, e)
    }
  }
  return results
}

/**
 * Show genres list.
 */
export async function fetchTmdbShowGenresExternal(): Promise<
  { id: number; name: string }[]
> {
  const data = await tmdbFetch<{ genres: { id: number; name: string }[] }>(
    "/genre/tv/list",
    { language: "en-US" }
  )
  return data.genres || []
}

/**
 * Discover shows by genre IDs.
 */
export async function fetchTmdbShowsByGenresExternal(
  genreIds: string,
  page: number = 1
) {
  return tmdbFetch<Record<string, unknown>>("/discover/tv", {
    include_adult: false,
    include_video: false,
    language: "en-US",
    page,
    sort_by: "popularity.desc",
    with_genres: genreIds,
    with_original_language: "en",
  })
}

/**
 * Trending shows (week).
 */
export async function fetchTrendingShowsExternal(): Promise<TmdbMedia[]> {
  const trending = await tmdbFetch<{ results: { id: number }[] }>(
    "/trending/tv/week",
    { language: "en-US" }
  )
  const ids = trending.results?.map((r) => r.id) || []
  return fetchTmdbShowsGroupExternal(ids)
}

/**
 * Season details (episodes).
 */
export async function fetchTmdbShowSeasonExternal(
  tmdbId: string,
  seasonNumber: number
): Promise<{ episodes?: Record<string, unknown>[] } & Record<string, unknown>> {
  return tmdbFetch(`/tv/${tmdbId}/season/${seasonNumber}`, {
    language: "en-US",
  })
}

/* --------------------------------------------------------------------------
 * Enrichment helpers
 * -------------------------------------------------------------------------- */

/**
 * Certification rating extraction for movie/TV (US-based).
 */
function extractCertification(media: TmdbMedia): string | null {
  if (media.media_type === "movie") {
    const rd = media.release_dates?.results || []
    const us = rd.find((r: Record<string, unknown>) => r.iso_3166_1 === "US")
    if (
      us &&
      us.release_dates &&
      us.release_dates.length &&
      us.release_dates[0].certification
    ) {
      return us.release_dates[0].certification || null
    }
    return null
  } else {
    const cr = media.content_ratings?.results || []
    const us = cr.find((r) => r.iso_3166_1 === "US")
    return us?.rating || null
  }
}

function extractTrailers(media: TmdbMedia) {
  if (!media.videos?.results?.length) return []
  return media.videos.results.filter(
    (v) => v.type === "Trailer" && v.site === "YouTube"
  )
}

async function enrichShow(show: TmdbMedia): Promise<TmdbMedia> {
  const certification = extractCertification({ ...show, media_type: "tv" })
  const trailers = extractTrailers(show)

  // Attach episodes to seasons
  if (show.seasons?.length && show.id) {
    const seasonsWithEpisodes = await Promise.all(
      show.seasons.map(async (s) => {
        const seasonData = await fetchTmdbShowSeasonExternal(
          String(show.id),
          s.season_number
        )
        return {
          ...s,
          episodes: seasonData.episodes || [],
        }
      })
    )
    show.seasons = seasonsWithEpisodes
  }

  return {
    ...show,
    certification_rating: certification,
    trailers,
    media_type: "tv",
  }
}

function enrichMovie(movie: TmdbMedia): TmdbMedia {
  const certification = extractCertification({ ...movie, media_type: "movie" })
  const trailers = extractTrailers(movie)
  return {
    ...movie,
    certification_rating: certification,
    trailers,
    media_type: "movie",
  }
}

/* --------------------------------------------------------------------------
 * Lite (card) fetches & cache
 * -------------------------------------------------------------------------- */

function toTmdbLiteBase(
  media: TmdbMedia,
  tmdbId: string,
  media_type: "movie" | "tv"
): TmdbLite {
  const yearSource =
    media_type === "movie" ? media.release_date : media.first_air_date
  const year =
    yearSource && yearSource.length >= 4 ? yearSource.slice(0, 4) : undefined
  const certification = extractCertification({ ...media, media_type })
  return {
    tmdbId,
    poster_path: media.poster_path,
    overview: media.overview,
    vote_average: media.vote_average,
    year,
    certification_rating: certification,
    media_type,
  }
}

/**
 * Minimal movie fetch for card enrichment.
 */
export async function fetchTmdbMovieLiteExternal(
  tmdbId: string
): Promise<TmdbLite> {
  const movie = await tmdbFetch<TmdbMedia>(`/movie/${tmdbId}`, {
    append_to_response: "release_dates",
    language: "en-US",
  })
  return toTmdbLiteBase(movie, tmdbId, "movie")
}

/**
 * Minimal show (tv) fetch for card enrichment.
 */
export async function fetchTmdbShowLiteExternal(
  tmdbId: string
): Promise<TmdbLite> {
  const show = await tmdbFetch<TmdbMedia>(`/tv/${tmdbId}`, {
    append_to_response: "content_ratings",
    language: "en-US",
  })
  return toTmdbLiteBase(show, tmdbId, "tv")
}

/**
 * Inner cache wrappers (no incremental) for lite data.
 */
export async function getTmdbMovieLiteRaw(tmdbId: string) {
  const cache = getCache()
  const key = buildKey(["tmdbMovieLite", tmdbId])
  const cached = await cache.get(key)
  if (cached) return cached as TmdbLite
  const data = await fetchTmdbMovieLiteExternal(tmdbId)
  await cache.set(key, data, ttl())
  return data
}

export async function getTmdbSeriesLiteRaw(tmdbId: string) {
  const cache = getCache()
  const key = buildKey(["tmdbSeriesLite", tmdbId])
  const cached = await cache.get(key)
  if (cached) return cached as TmdbLite
  const data = await fetchTmdbShowLiteExternal(tmdbId)
  await cache.set(key, data, ttl())
  return data
}

/* --------------------------------------------------------------------------
 * Caching wrappers (RAW + Incremental)
 * -------------------------------------------------------------------------- */

export async function getTmdbSeriesInfoRaw(tmdbId: string) {
  const cache = getCache()
  const key = buildKey(["tmdbSeriesInfo", tmdbId])
  const cached = await cache.get(key)
  if (cached) return cached as TmdbMedia
  const data = await fetchTmdbShowExternal(tmdbId)
  await cache.set(key, data, ttl())
  return data
}

export async function getTmdbSeriesInfo(tmdbId: string) {
  if (shouldSkipIncremental(tmdbId)) {
    return getTmdbSeriesInfoRaw(tmdbId)
  }
  const wrapped = unstable_cache(
    async () => getTmdbSeriesInfoRaw(tmdbId),
    ["tmdbSeriesInfo", tmdbId],
    {
      revalidate: ttl(),
      tags: ["tmdbSeriesInfo", `tmdbSeriesInfo:${tmdbId}`],
    }
  )
  return wrapped()
}

export async function getTmdbMovieInfoRaw(tmdbId: string) {
  const cache = getCache()
  const key = buildKey(["tmdbMovieInfo", tmdbId])
  const cached = await cache.get(key)
  if (cached) return cached as TmdbMedia
  const data = await fetchTmdbMovieExternal(tmdbId)
  await cache.set(key, data, ttl())
  return data
}

export async function getTmdbMovieInfo(tmdbId: string) {
  if (shouldSkipIncremental(tmdbId)) {
    return getTmdbMovieInfoRaw(tmdbId)
  }
  const wrapped = unstable_cache(
    async () => getTmdbMovieInfoRaw(tmdbId),
    ["tmdbMovieInfo", tmdbId],
    {
      revalidate: ttl(),
      tags: ["tmdbMovieInfo", `tmdbMovieInfo:${tmdbId}`],
    }
  )
  return wrapped()
}

/* --------------------------------------------------------------------------
 * Exposed generic certification helper (if needed elsewhere).
 * -------------------------------------------------------------------------- */

export function computeTmdbCertification(
  media: TmdbMedia & { media_type: string }
) {
  return extractCertification(media)
}
