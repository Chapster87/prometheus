/**
 * Movie data access with layered caching:
 * 1. External fetch via fetchMoviesExternal (no-store).
 * 2. Internal process-level cache (memory | redis | none) via getCache().
 * 3. Next.js incremental cache via unstable_cache (per key).
 *
 * Public function: getMovies(categoryId)
 *  - Automatically chooses cache backend based on env vars.
 *  - Supports tag invalidation (revalidateTag('movies')) if desired.
 */

import { unstable_cache, revalidateTag } from "next/cache"
import { getCache, buildKey } from "@/server/cache"
import {
  fetchMovieCategoriesExternal,
  fetchMoviesExternal,
  fetchMovieInfoExternal,
} from "@/server/spark"

const DEFAULT_CATEGORY = "X"

export interface MovieWrapper {
  categoryId: string
  categoryName: string | null
  items: unknown
}

export interface MovieCategory {
  category_id: string
  category_name: string
  parent_id?: number
}

function findCategoryName(
  categories: MovieCategory[],
  categoryId: string
): string | null {
  const match = categories.find(
    (c) => String(c.category_id) === String(categoryId)
  )
  return match ? match.category_name : null
}

function ttl(): number {
  const raw = process.env.CACHE_TTL_SECONDS
  const n = raw ? parseInt(raw, 10) : 300
  return Number.isFinite(n) && n > 0 ? n : 300
}

export async function getMoviesCategoriesRaw() {
  const cache = getCache()
  const key = buildKey(["movies", "categories"])
  const cached = await cache.get(key)
  if (cached) {
    // console.log(`Cache hit for key: ${key}`)
    return cached
  }
  const data = await fetchMovieCategoriesExternal()
  await cache.set(key, data, ttl())
  return data
}

/**
 * Raw data retrieval with inner (memory/redis) caching.
 */
export async function getMoviesRaw(categoryId: string) {
  const cache = getCache()
  const key = buildKey(["movies", categoryId])
  const cachedRaw = await cache.get(key)
  if (cachedRaw) {
    return cachedRaw as MovieWrapper
  }
  const items = await fetchMoviesExternal(categoryId)
  // Reuse cached categories (inner cache); avoids extra external request.
  const categories = await getMoviesCategoriesRaw()
  const categoryName = Array.isArray(categories)
    ? findCategoryName(categories as MovieCategory[], categoryId)
    : null
  const data: MovieWrapper = { categoryId, categoryName, items }
  await cache.set(key, data, ttl())
  return data
}

export async function getMovieInfoRaw(movieId: string) {
  const cache = getCache()
  const key = buildKey(["movieInfo", movieId])
  const cached = await cache.get(key)
  if (cached) {
    return cached
  }
  const data = await fetchMovieInfoExternal(movieId)
  await cache.set(key, data, ttl())
  return data
}

/**
 * Invalidate a specific category or all.
 */
function revalidateTagSafe(tag: string) {
  // Cast to a single-arg signature without using `any` to satisfy eslint.
  ;(revalidateTag as unknown as (t: string) => void)(tag)
}

export async function invalidateMovies(categoryId?: string) {
  const cache = getCache()
  if (categoryId) {
    await cache.del(buildKey(["movies", categoryId]))
    if (process.env.CACHE_ENABLE_TAG_INVALIDATION === "true") {
      revalidateTagSafe(`movies:${categoryId}`)
    }
  } else {
    // Broad tag invalidation
    if (process.env.CACHE_ENABLE_TAG_INVALIDATION === "true") {
      revalidateTagSafe("movies")
    }
  }
}

/**
 * Public retrieval with optional Next.js incremental cache (unstable_cache).
 * Skips incremental cache for large categories or when disabled by env vars.
 *
 * Env:
 *  - MOVIES_CACHE_SKIP=cat1,cat2   (skip incremental cache for listed categories)
 *  - MOVIES_DISABLE_INCREMENTAL_CACHE=true   (skip for all)
 */
const SKIP_LIST = (process.env.MOVIES_CACHE_SKIP || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean)

function shouldSkipIncremental(categoryId: string): boolean {
  if (process.env.MOVIES_DISABLE_INCREMENTAL_CACHE === "true") return true
  // Always skip default category to avoid large payload hitting 2MB limit
  if (categoryId === DEFAULT_CATEGORY) return true
  return SKIP_LIST.includes(categoryId)
}

export async function getMoviesCategories() {
  if (shouldSkipIncremental("categories")) {
    // Use inner cache only (memory/redis) without unstable_cache to avoid size limits.
    return getMoviesCategoriesRaw()
  }
  const wrapped = unstable_cache(
    async () => getMoviesCategoriesRaw(),
    ["movies", "categories"],
    {
      revalidate: ttl(),
      tags: ["movies", "movies:categories"],
    }
  )
  return wrapped()
}

export function getMovies(categoryId: string = DEFAULT_CATEGORY) {
  const cat = categoryId || DEFAULT_CATEGORY
  if (shouldSkipIncremental(cat)) {
    // Use inner cache only (memory/redis) without unstable_cache to avoid size limits.
    return getMoviesRaw(cat)
  }
  const wrapped = unstable_cache(
    async () => getMoviesRaw(cat),
    ["movies", cat],
    {
      revalidate: ttl(),
      tags: ["movies", `movies:${cat}`],
    }
  )
  return wrapped()
}

/**
 * Batch retrieval for multiple categories.
 */
export async function getMoviesBatch(categories: string[]) {
  const unique = [...new Set(categories.filter(Boolean))]
  const results = await Promise.all(
    unique.map((c) =>
      shouldSkipIncremental(c) ? getMoviesRaw(c) : getMovies(c)
    )
  )
  return Object.fromEntries(unique.map((c, i) => [c, results[i]]))
}

export async function getMovieInfo(movieId: string) {
  if (shouldSkipIncremental(movieId)) {
    return getMovieInfoRaw(movieId)
  }
  const wrapped = unstable_cache(
    async () => getMovieInfoRaw(movieId),
    ["movieInfo", movieId],
    {
      revalidate: ttl(),
      tags: ["movieInfo", `movieInfo:${movieId}`],
    }
  )
  return wrapped()
}
