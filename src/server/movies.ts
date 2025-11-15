/**
 * Movies (VOD) data access with layered caching:
 * 1. External fetch via fetchMovieCategoriesExternal / fetchMoviesExternal (no-store).
 * 2. Internal process-level cache (memory | redis | none) via getCache().
 * 3. Optional Next.js incremental cache via unstable_cache (per key) unless skipped.
 *
 * Public functions:
 *  - getMoviesCategories()
 *  - getMovies(categoryId)
 *  - getMoviesBatch(categories)
 *
 * Skip logic mirrors series implementation using MOVIES_* env vars.
 *
 * Env:
 *  - MOVIES_CACHE_SKIP=cat1,cat2   (skip incremental cache for listed categories)
 *  - MOVIES_DISABLE_INCREMENTAL_CACHE=true   (skip for all)
 */

import { unstable_cache } from "next/cache"
import { getCache, buildKey } from "@/server/cache"
import {
  fetchMovieCategoriesExternal,
  fetchMoviesExternal,
} from "@/server/spark"

const DEFAULT_CATEGORY = "X"

export interface MovieCategory {
  category_id: string
  category_name: string
  parent_id?: number
}

export interface MovieWrapper {
  categoryId: string
  categoryName: string | null
  items: unknown
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
    return cached
  }
  const data = await fetchMovieCategoriesExternal()
  await cache.set(key, data, ttl())
  return data
}

/**
 * Raw data retrieval for a single category with inner caching.
 */
export async function getMoviesRaw(categoryId: string) {
  const cache = getCache()
  const key = buildKey(["movies", categoryId])
  const cachedRaw = await cache.get(key)
  if (cachedRaw) {
    return cachedRaw as MovieWrapper
  }
  const items = await fetchMoviesExternal(categoryId)
  const categories = await getMoviesCategoriesRaw()
  const categoryName = Array.isArray(categories)
    ? findCategoryName(categories as MovieCategory[], categoryId)
    : null
  const data: MovieWrapper = { categoryId, categoryName, items }
  await cache.set(key, data, ttl())
  return data
}

/**
 * Skip logic for incremental cache.
 */
const MOVIES_SKIP_LIST = (process.env.MOVIES_CACHE_SKIP || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean)

function shouldSkipIncremental(categoryId: string): boolean {
  if (process.env.MOVIES_DISABLE_INCREMENTAL_CACHE === "true") return true
  // Always skip default (likely largest) to avoid size limit
  if (categoryId === DEFAULT_CATEGORY) return true
  return MOVIES_SKIP_LIST.includes(categoryId)
}

export async function getMoviesCategories() {
  if (shouldSkipIncremental("categories")) {
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
