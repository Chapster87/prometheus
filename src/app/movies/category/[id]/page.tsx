import { ReactQueryProvider } from "@/client/query/Provider"
import { getMoviesRaw, getMovies } from "@/server/movies"
import type { DehydratedState } from "@tanstack/react-query"
import { QueryClient, dehydrate } from "@tanstack/react-query"
import MoviesCategoryClient from "./category.client"
import { notFound } from "next/navigation"

const SIZE_LIMIT_BYTES = 1.8 * 1024 * 1024

type CategoryParams = { id?: string }

export async function generateMetadata({ params }: { params: CategoryParams }) {
  const resolvedParams = await params
  const categoryId = resolvedParams?.id
    ? resolvedParams.id.trim()
    : "Unknown Category"
  return {
    title: `Movie Category - ${categoryId}`,
  }
}

/**
 * Dynamic movie category page with size-gated hydration mirroring series implementation.
 * Steps:
 * 1. Probe size via getMoviesRaw (inner cache only).
 * 2. If under threshold, fetch again via getMovies to populate incremental cache.
 * 3. Build dehydrated state priming query keys:
 *    - ["movies", categoryId]
 *    - ["moviesBatch", [categoryId].sort()]
 * Oversized payloads skip hydration to reduce response size.
 */
export default async function MovieCategoryPage({
  params,
}: {
  params: CategoryParams
}) {
  const resolvedParams = await params
  const categoryId = resolvedParams?.id ? resolvedParams.id.trim() : null
  if (!categoryId) {
    console.warn("Missing movie category id; returning 404")
    notFound()
  }

  const categories = [categoryId]
  let dehydrated: DehydratedState | null = null

  try {
    const probe = await getMoviesRaw(categoryId)
    const sizeEstimate = Buffer.byteLength(JSON.stringify(probe))
    if (sizeEstimate < SIZE_LIMIT_BYTES) {
      const cachedData = await getMovies(categoryId)
      const qc = new QueryClient()
      qc.setQueryData(["movies", categoryId], cachedData)
      qc.setQueryData(["moviesBatch", [categoryId].sort()], cachedData)
      dehydrated = dehydrate(qc)
    } else {
      console.warn(
        `Prefetch size ${sizeEstimate} >= ${SIZE_LIMIT_BYTES}; skip hydration for movie category ${categoryId}`
      )
    }
  } catch (e) {
    console.error(
      "Movie category prefetch probe failed; fallback to client fetch",
      e
    )
  }

  return (
    <div className="page">
      <main className="main">
        <ReactQueryProvider initialState={dehydrated}>
          <MoviesCategoryClient categories={categories} />
        </ReactQueryProvider>
      </main>
    </div>
  )
}
