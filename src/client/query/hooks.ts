"use client"
import { useQuery } from "@tanstack/react-query"

/**
 * Fetch function hitting composite endpoint.
 */
export async function fetchSeriesCategories() {
  const url = `/api/series/categories`
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch series categories")
  return res.json() as Promise<string[]>
}

interface SeriesWrapper {
  categoryId: string
  categoryName: string | null
  items: unknown
}

type SeriesBatchResponse = SeriesWrapper | Record<string, SeriesWrapper>

async function fetchSeriesBatch(
  categories: string[]
): Promise<SeriesBatchResponse> {
  const url = `/api/series?categories=${categories.join(",")}`
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch series batch")
  const json = await res.json()
  if (categories.length === 1) {
    return json as SeriesWrapper
  }
  return json as Record<string, SeriesWrapper>
}

async function fetchSingleSeries(category: string): Promise<SeriesWrapper> {
  const data = await fetchSeriesBatch([category])
  if (data && typeof data === "object" && "items" in (data as SeriesWrapper)) {
    return data as SeriesWrapper
  }
  return (data as Record<string, SeriesWrapper>)[category]
}

export function useSeriesCategories() {
  return useQuery({
    queryKey: ["series", "categories"],
    queryFn: fetchSeriesCategories,
  })
}

/**
 * Hook for a single category.
 */
export function useSeries(category: string) {
  return useQuery({
    queryKey: ["series", category],
    queryFn: () => fetchSingleSeries(category),
  })
}

/**
 * Hook for batch categories (shared composite request).
 * Uses one query rather than many when categories > 1 for efficiency.
 */
export function useSeriesBatch(categories: string[]) {
  const canonical = [...new Set(categories.filter(Boolean))]
  return useQuery({
    queryKey: ["seriesBatch", canonical.sort()],
    queryFn: () => fetchSeriesBatch(canonical),
  })
}
