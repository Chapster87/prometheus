/**
 * Server-only external API access layer (replaces client-visible Spark.js).
 *
 * Uses environment variables WITHOUT NEXT_PUBLIC_ prefix to avoid exposing credentials.
 *
 * Required env vars (examples):
 *  - XC_URL=https://example.com
 *  - XC_USERNAME=yourUser
 *  - XC_PASSWORD=yourPass
 *
 * Optional:
 *  - CACHE_TTL_SECONDS
 *
 * Notes:
 *  - Do NOT import this file in client components; keep calls server-side.
 *  - fetch() used instead of axios to integrate with Next.js caching / runtime.
 */

const baseURL = process.env.XC_URL
const username = process.env.XC_USERNAME
const password = process.env.XC_PASSWORD

if (!baseURL) {
  // Fail fast so misconfiguration surfaces early.
  console.warn("XC_URL not set (server/spark.ts)")
}

/**
 * Builds query string for external API.
 */
function buildQuery(params: Record<string, string | undefined>): string {
  const qp = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(
      ([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`
    )
  return qp.join("&")
}

/**
 * Low-level external fetch.
 */
async function externalFetch<T>(
  action?: string,
  extra?: Record<string, string | undefined>
): Promise<T> {
  if (!username || !password) {
    throw new Error("Missing XC_USERNAME / XC_PASSWORD")
  }
  const query = buildQuery({
    username,
    password,
    action,
    ...(extra || {}),
  })
  const url = `${baseURL}/player_api.php?${query}`

  const res = await fetch(url, {
    // External API response should not be cached by Next implicit fetch caching.
    cache: "no-store",
  })

  if (!res.ok) {
    throw new Error(`External API error ${res.status}`)
  }

  return (await res.json()) as T
}

// Define types for the expected responses
interface UserInfo {
  auth: number
  username?: string
  email?: string
  // Add other known properties here
}

interface AccountInfoResponse {
  user_info: UserInfo
}

interface SeriesResponse {
  id: string
  name: string
  category: string
  // Add other known properties here
}

interface MovieCategory {
  category_id: string
  category_name: string
  parent_id?: number
}

type MovieCategoryResponse = MovieCategory[]

interface MovieStream {
  stream_id: string
  name?: string
  title?: string
  year?: string
  category_id?: string
  // Extend with other known properties if needed
}

type MovieStreamResponse = MovieStream[]

/**
 * Fetch account info & basic authentication check.
 */
export async function fetchAccountInfoExternal() {
  const data = await externalFetch<AccountInfoResponse>() // Use the defined type
  if (data?.user_info?.auth === 0) {
    throw new Error("Authentication Error")
  }
  return data.user_info
}

export async function fetchSeriesCategoriesExternal() {
  const data = await externalFetch<SeriesResponse>("get_series_categories")
  return data
}

export async function fetchMovieCategoriesExternal() {
  const data = await externalFetch<MovieCategoryResponse>("get_vod_categories")
  return data
}

export async function fetchMoviesExternal(categoryId: string) {
  const data = await externalFetch<MovieStreamResponse>("get_vod_streams", {
    category_id: categoryId,
  })
  return data
}

/**
 * Fetch series list for a category.
 */
export async function fetchSeriesExternal(categoryId: string) {
  const data = await externalFetch<SeriesResponse>("get_series", {
    category_id: categoryId,
  })
  return data
}

export async function fetchSeriesInfoExternal(seriesId: string) {
  if (!seriesId) {
    const message = `Vod Id not defined`
    throw new Error(message)
  }
  const data = await externalFetch<SeriesResponse>("get_series_info", {
    series_id: seriesId,
  })

  return data
}
