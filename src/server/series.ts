/**
 * Series data access with layered caching:
 * 1. External fetch via fetchSeriesExternal (no-store).
 * 2. Internal process-level cache (memory | redis | none) via getCache().
 * 3. Next.js incremental cache via unstable_cache (per key).
 *
 * Public function: getSeries(categoryId)
 *  - Automatically chooses cache backend based on env vars.
 *  - Supports tag invalidation (revalidateTag('series')) if desired.
 */

import { unstable_cache, revalidateTag } from "next/cache"
import { getCache, buildKey } from "@/server/cache"
import {
  fetchSeriesCategoriesExternal,
  fetchSeriesExternal,
} from "@/server/spark"

const DEFAULT_CATEGORY = "X"

export interface SeriesWrapper {
  categoryId: string
  categoryName: string | null
  items: unknown
}

export interface SeriesCategory {
  category_id: string
  category_name: string
  parent_id?: number
}

function findCategoryName(
  categories: SeriesCategory[],
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

export async function getSeriesCategoriesRaw() {
  const cache = getCache()
  const key = buildKey(["series", "categories"])
  const cached = await cache.get(key)
  if (cached) {
    // console.log(`Cache hit for key: ${key}`)
    return cached
  }
  const data = await fetchSeriesCategoriesExternal()
  await cache.set(key, data, ttl())
  return data
}

/**
 * Raw data retrieval with inner (memory/redis) caching.
 */
export async function getSeriesRaw(categoryId: string) {
  const cache = getCache()
  const key = buildKey(["series", categoryId])
  const cachedRaw = await cache.get(key)
  if (cachedRaw) {
    return cachedRaw as SeriesWrapper
  }
  const items = await fetchSeriesExternal(categoryId)
  // Reuse cached categories (inner cache); avoids extra external request.
  const categories = await getSeriesCategoriesRaw()
  const categoryName = Array.isArray(categories)
    ? findCategoryName(categories as SeriesCategory[], categoryId)
    : null
  const data: SeriesWrapper = { categoryId, categoryName, items }
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

export async function invalidateSeries(categoryId?: string) {
  const cache = getCache()
  if (categoryId) {
    await cache.del(buildKey(["series", categoryId]))
    if (process.env.CACHE_ENABLE_TAG_INVALIDATION === "true") {
      revalidateTagSafe(`series:${categoryId}`)
    }
  } else {
    // Broad tag invalidation
    if (process.env.CACHE_ENABLE_TAG_INVALIDATION === "true") {
      revalidateTagSafe("series")
    }
  }
}

/**
 * Public retrieval with optional Next.js incremental cache (unstable_cache).
 * Skips incremental cache for large categories or when disabled by env vars.
 *
 * Env:
 *  - SERIES_CACHE_SKIP=cat1,cat2   (skip incremental cache for listed categories)
 *  - SERIES_DISABLE_INCREMENTAL_CACHE=true   (skip for all)
 */
const SKIP_LIST = (process.env.SERIES_CACHE_SKIP || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean)

function shouldSkipIncremental(categoryId: string): boolean {
  if (process.env.SERIES_DISABLE_INCREMENTAL_CACHE === "true") return true
  // Always skip default category to avoid large payload hitting 2MB limit
  if (categoryId === DEFAULT_CATEGORY) return true
  return SKIP_LIST.includes(categoryId)
}

export async function getSeriesCategories() {
  if (shouldSkipIncremental("categories")) {
    // Use inner cache only (memory/redis) without unstable_cache to avoid size limits.
    return getSeriesCategoriesRaw()
  }
  const wrapped = unstable_cache(
    async () => getSeriesCategoriesRaw(),
    ["series", "categories"],
    {
      revalidate: ttl(),
      tags: ["series", "series:categories"],
    }
  )
  return wrapped()
}

export function getSeries(categoryId: string = DEFAULT_CATEGORY) {
  const cat = categoryId || DEFAULT_CATEGORY
  if (shouldSkipIncremental(cat)) {
    // Use inner cache only (memory/redis) without unstable_cache to avoid size limits.
    return getSeriesRaw(cat)
  }
  const wrapped = unstable_cache(
    async () => getSeriesRaw(cat),
    ["series", cat],
    {
      revalidate: ttl(),
      tags: ["series", `series:${cat}`],
    }
  )
  return wrapped()
}

/**
 * Batch retrieval for multiple categories.
 */
export async function getSeriesBatch(categories: string[]) {
  const unique = [...new Set(categories.filter(Boolean))]
  const results = await Promise.all(
    unique.map((c) =>
      shouldSkipIncremental(c) ? getSeriesRaw(c) : getSeries(c)
    )
  )
  return Object.fromEntries(unique.map((c, i) => [c, results[i]]))
}
