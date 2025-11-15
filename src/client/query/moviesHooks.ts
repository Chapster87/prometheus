"use client"
import { useQuery } from "@tanstack/react-query"

/**
 * Fetch movie (VOD) categories.
 */
export async function fetchMovieCategories() {
  const url = `/api/movies/categories`
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch movie categories")
  return res.json() as Promise<unknown>
}

interface MovieWrapper {
  categoryId: string
  categoryName: string | null
  items: unknown
}

type MovieBatchResponse = MovieWrapper | Record<string, MovieWrapper>

async function fetchMoviesBatch(
  categories: string[]
): Promise<MovieBatchResponse> {
  const url = `/api/movies?categories=${categories.join(",")}`
  try {
    const res = await fetch(url)
    if (!res.ok) {
      console.error("Failed to fetch movies batch:", res.status, res.statusText)
      throw new Error("Failed to fetch movies batch")
    }
    const json = await res.json()
    if (categories.length === 1) {
      return json as MovieWrapper
    }
    return json as Record<string, MovieWrapper>
  } catch (error) {
    console.error("Error in fetchMoviesBatch:", error)
    return {} as Record<string, MovieWrapper>
  }
}

async function fetchSingleMoviesCategory(
  category: string
): Promise<MovieWrapper> {
  const data = await fetchMoviesBatch([category])
  if (data && typeof data === "object" && "items" in (data as MovieWrapper)) {
    return data as MovieWrapper
  }
  return (data as Record<string, MovieWrapper>)[category]
}

/**
 * Hook for movie categories list.
 */
export function useMovieCategories() {
  return useQuery({
    queryKey: ["movies", "categories"],
    queryFn: fetchMovieCategories,
  })
}

/**
 * Hook for a single movie category.
 */
export function useMovies(category: string) {
  return useQuery({
    queryKey: ["movies", category],
    queryFn: () => fetchSingleMoviesCategory(category),
  })
}

/**
 * Hook for batch movie categories.
 */
export function useMoviesBatch(categories: string[]) {
  const canonical = [...new Set(categories.filter(Boolean))]
  return useQuery({
    queryKey: ["moviesBatch", canonical.sort()],
    queryFn: () => fetchMoviesBatch(canonical),
    staleTime: 5 * 60 * 1000,
  })
}
