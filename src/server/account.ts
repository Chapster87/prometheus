/**
 * Account data access with layered caching (similar to series):
 * 1. External fetch via fetchAccountInfoExternal (no-store).
 * 2. Internal process-level cache (memory | redis | none).
 * 3. Optional Next.js incremental cache via unstable_cache (tag based).
 *
 * Public function: getAccount()
 *  - Returns authenticated account/user_info object.
 *  - Respects CACHE_TTL_SECONDS for both inner and incremental cache.
 *  - Tag invalidation enabled when env CACHE_ENABLE_TAG_INVALIDATION === "true".
 *
 * Invalidation: invalidateAccount()
 */

import { unstable_cache, revalidateTag } from "next/cache"
import { getCache, buildKey } from "@/server/cache"
import { fetchAccountInfoExternal } from "@/server/spark"

function ttl(): number {
  const raw = process.env.CACHE_TTL_SECONDS
  const n = raw ? parseInt(raw, 10) : 300
  return Number.isFinite(n) && n > 0 ? n : 300
}

/**
 * Raw retrieval using pluggable cache backend (memory/redis/none).
 */
export async function getAccountRaw() {
  const cache = getCache()
  const key = buildKey(["account", "info"])
  const cached = await cache.get(key)
  if (cached) {
    return cached
  }
  const data = await fetchAccountInfoExternal()
  await cache.set(key, data, ttl())
  return data
}

/**
 * Safe revalidateTag wrapper (type casting).
 */
function revalidateTagSafe(tag: string) {
  ;(revalidateTag as unknown as (t: string) => void)(tag)
}

/**
 * Invalidate cached account info + Next.js tags.
 */
export async function invalidateAccount() {
  const cache = getCache()
  await cache.del(buildKey(["account", "info"]))
  if (process.env.CACHE_ENABLE_TAG_INVALIDATION === "true") {
    revalidateTagSafe("account")
  }
}

/**
 * High-level retrieval with optional Next.js incremental cache.
 *
 * Env:
 *  - ACCOUNT_DISABLE_INCREMENTAL_CACHE=true  (skip unstable_cache entirely)
 */
function shouldSkipIncremental(): boolean {
  return process.env.ACCOUNT_DISABLE_INCREMENTAL_CACHE === "true"
}

export function getAccount() {
  if (shouldSkipIncremental()) {
    return getAccountRaw()
  }
  const wrapped = unstable_cache(
    async () => getAccountRaw(),
    ["account", "info"],
    {
      revalidate: ttl(),
      tags: ["account"],
    }
  )
  return wrapped()
}
