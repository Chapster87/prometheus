"use client"
import { useQuery, useQueries, QueryClient } from "@tanstack/react-query"

/**
 * Fetch function hitting composite endpoint.
 */
export async function fetchSeriesCategories() {
  const url = `/api/series/categories`
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch series categories")
  return res.json() as Promise<string[]>
}

async function fetchSeriesBatch(categories: string[]) {
  const url = `/api/series?categories=${categories.join(",")}`
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch series batch")
  return res.json() as Promise<Record<string, unknown>>
}

async function fetchSingleSeries(category: string) {
  const data = await fetchSeriesBatch([category])
  return data[category]
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
