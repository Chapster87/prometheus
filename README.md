This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Caching & External API Configuration

This project uses a layered caching strategy for series data:

1. External API fetch (no-store) via `src/server/spark.ts`
2. Internal cache (memory | redis | none) via `src/server/cache.ts`
3. Next.js incremental cache (`unstable_cache`) via `src/server/series.ts`
4. Optional CDN caching headers on API responses

### Environment Variables

| Variable                        | Purpose                                 | Example                       | Required                 |
| ------------------------------- | --------------------------------------- | ----------------------------- | ------------------------ |
| `CACHE_BACKEND`                 | Cache backend selector                  | `memory` \| `redis` \| `none` | No (defaults `memory`)   |
| `REDIS_URL`                     | Redis connection URL (when using redis) | `rediss://:pass@host:port`    | If `CACHE_BACKEND=redis` |
| `CACHE_TTL_SECONDS`             | TTL for internal + incremental cache    | `300`                         | No (default 300)         |
| `CACHE_ENABLE_TAG_INVALIDATION` | Enable tag revalidation usage           | `true`                        | No (default unset/false) |

### Backend Selection

- `memory`: In-process Map with TTL (default; good for development)
- `redis`: Shared cache across instances (install `ioredis`)
- `none`: Disables internal layer; only Next.js incremental + CDN caches apply

Toggle without code changes by switching `CACHE_BACKEND`.

### Series Endpoints

- Single: `/api/all-series` (default category `X`)
- Composite: `/api/series?categories=A,B,C`

Both leverage internal + incremental caching; composite batches categories to reduce round trips.

### Invalidation & Admin Endpoint

Programmatic invalidation:

```ts
import { invalidateSeries } from "@/server/series"
// Invalidate one category:
await invalidateSeries("A")
// Invalidate all:
await invalidateSeries()
```

Admin HTTP endpoint (secured via ADMIN_TOKEN):

- Path: `POST /api/admin/invalidate-series`
- Headers: `x-admin-token: <ADMIN_TOKEN>`
- Body (optional): `{ "categoryId": "X" }`
- Response: `{ invalidated: "X" }` or `{ invalidated: "all" }`

Example requests (paste-ready):

Curl (invalidate one category X):

```bash
curl -X POST http://localhost:3000/api/admin/invalidate-series \
  -H "x-admin-token: b3f8c0e9a4d11f2db7c6e54a8d39fb2e1a7c4e3d9f6b2a18c7d4f5a2e9b1c3d" \
  -H "Content-Type: application/json" \
  -d '{"categoryId":"X"}'
```

Curl (invalidate all):

```bash
curl -X POST http://localhost:3000/api/admin/invalidate-series \
  -H "x-admin-token: b3f8c0e9a4d11f2db7c6e54a8d39fb2e1a7c4e3d9f6b2a18c7d4f5a2e9b1c3d" \
  -H "Content-Type: application/json" \
  -d '{}'
```

PowerShell (invalidate one category X):

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/admin/invalidate-series" -Method POST -Headers @{ "x-admin-token" = "b3f8c0e9a4d11f2db7c6e54a8d39fb2e1a7c4e3d9f6b2a18c7d4f5a2e9b1c3d"; "Content-Type" = "application/json" } -Body '{"categoryId":"X"}'
```

PowerShell (invalidate all):

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/admin/invalidate-series" -Method POST -Headers @{ "x-admin-token" = "b3f8c0e9a4d11f2db7c6e54a8d39fb2e1a7c4e3d9f6b2a18c7d4f5a2e9b1c3d"; "Content-Type" = "application/json" } -Body '{}'
```

If `categoryId` omitted or empty, all series caches are invalidated.

Env:

- `ADMIN_TOKEN` must be set in deployment environment (NOT exposed to client).

Enable tag-based revalidation by setting `CACHE_ENABLE_TAG_INVALIDATION=true`.

### Adding Redis Later

1. `npm install ioredis`
2. Set:

```
CACHE_BACKEND=redis
REDIS_URL=rediss://:password@host:port
```

3. (Optional) Adjust `CACHE_TTL_SECONDS`.

### Client Fetching

Prefer server fetching (Server Components). If client-side needed, hydrate SWR/React Query with server data to prevent refetch storms.
