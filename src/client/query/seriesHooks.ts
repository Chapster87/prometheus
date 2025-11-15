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
  try {
    const res = await fetch(url)
    if (!res.ok) {
      console.error("Failed to fetch series batch:", res.status, res.statusText)
      throw new Error("Failed to fetch series batch")
    }
    const json = await res.json()
    if (categories.length === 1) {
      return json as SeriesWrapper
    }
    return json as Record<string, SeriesWrapper>
  } catch (error) {
    console.error("Error in fetchSeriesBatch:", error)
    return {} as Record<string, SeriesWrapper>
  }
}

async function fetchSingleSeries(category: string): Promise<SeriesWrapper> {
  const data = await fetchSeriesBatch([category])
  if (data && typeof data === "object" && "items" in (data as SeriesWrapper)) {
    return data as SeriesWrapper
  }
  return (data as Record<string, SeriesWrapper>)[category]
}

async function fetchSeriesInfo(seriesId: string): Promise<unknown> {
  const data = await fetch(
    `/api/series/info?id=${encodeURIComponent(seriesId)}`
  )
  if (!data.ok) throw new Error("Failed to fetch series info")
  return data.json() as Promise<unknown>
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
 * Hook for batch categories.
 */
export function useSeriesBatch(categories: string[]) {
  const canonical = [...new Set(categories.filter(Boolean))]
  return useQuery({
    queryKey: ["seriesBatch", canonical.sort()],
    queryFn: () => fetchSeriesBatch(canonical),
    staleTime: 5 * 60 * 1000,
  })
}

export function useSeriesInfo(seriesId: string) {
  return useQuery({
    queryKey: ["seriesInfo", seriesId],
    queryFn: () => fetchSeriesInfo(seriesId),
  })
}

async function fetchTmdbSeriesInfo(tmdbId: string): Promise<unknown> {
  if (!tmdbId) {
    throw new Error("Missing tmdbId")
  }
  const res = await fetch(`/api/series/tmdb?id=${encodeURIComponent(tmdbId)}`)
  if (!res.ok) throw new Error("Failed to fetch TMDB series info")
  return res.json() as Promise<unknown>
}

export function useTmdbSeriesInfo(tmdbId: string | undefined) {
  return useQuery({
    queryKey: ["tmdbSeriesInfo", tmdbId || ""],
    queryFn: () => fetchTmdbSeriesInfo(tmdbId || ""),
    enabled: !!tmdbId,
  })
}
