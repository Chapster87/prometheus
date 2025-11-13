/**
 * Pluggable cache layer: memory | redis | none
 * Toggle via env var CACHE_BACKEND.
 *
 * Env Vars:
 *  - CACHE_BACKEND=memory | redis | none (default: memory)
 *  - REDIS_URL=rediss://:password@host:port (only if redis)
 *  - CACHE_TTL_SECONDS=300
 */
/* eslint-disable @typescript-eslint/no-require-imports */
export interface CacheClient {
  get(key: string): Promise<unknown | null>
  set(key: string, value: unknown, ttlSeconds?: number): Promise<void>
  del(key: string): Promise<void>
}

let _client: CacheClient | undefined

function ttl(): number {
  const raw = process.env.CACHE_TTL_SECONDS
  const n = raw ? parseInt(raw, 10) : 300
  return Number.isFinite(n) && n > 0 ? n : 300
}

export function getCache(): CacheClient {
  if (_client) return _client

  const backend = (process.env.CACHE_BACKEND || "memory").toLowerCase()

  if (backend === "redis") {
    // Dynamic require so that redis dependency is only needed when enabled.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let RedisConstructor: new (...args: unknown[]) => {
      get(key: string): Promise<string | null>
      set(
        key: string,
        value: string,
        mode: string,
        ttlSeconds: number
      ): Promise<void>
      del(key: string): Promise<void>
    }
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      // Using require to avoid bundling ioredis when not needed (CACHE_BACKEND != redis).
      const mod = require("ioredis")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      RedisConstructor = (mod.Redis || mod.default || mod) as any
    } catch (e) {
      console.error(
        "Redis backend selected but ioredis module not found. Install with `npm install ioredis`."
      )
      throw e
    }

    const url = process.env.REDIS_URL
    if (!url) {
      throw new Error("REDIS_URL not set while CACHE_BACKEND=redis")
    }
    const redis = new RedisConstructor(url)

    _client = {
      async get(key) {
        const raw = await redis.get(key)
        return raw ? JSON.parse(raw) : null
      },
      async set(key, value, ttlSeconds = ttl()) {
        const data = JSON.stringify(value)
        await redis.set(key, data, "EX", ttlSeconds)
      },
      async del(key) {
        await redis.del(key)
      },
    }
    return _client
  }

  if (backend === "none") {
    _client = {
      async get() {
        return null
      },
      async set() {
        /* no-op */
      },
      async del() {
        /* no-op */
      },
    }
    return _client
  }

  // In-memory backend (default)
  type Entry = { value: unknown; expiry: number }
  const store = new Map<string, Entry>()

  _client = {
    async get(key: string): Promise<unknown | null> {
      const entry = store.get(key)
      if (!entry) return null
      if (entry.expiry < Date.now()) {
        store.delete(key)
        return null
      }
      return entry.value
    },
    async set(key: string, value: unknown, ttlSeconds = ttl()): Promise<void> {
      store.set(key, { value, expiry: Date.now() + ttlSeconds * 1000 })
    },
    async del(key: string): Promise<void> {
      store.delete(key)
    },
  }
  return _client as CacheClient
}

/**
 * Helper to build cache keys with consistent prefixing.
 */
export function buildKey(parts: (string | number | undefined)[]): string {
  return parts.filter(Boolean).join(":")
}
