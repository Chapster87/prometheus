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

async function fetchTmdbMovieLiteInfo(tmdbId: string): Promise<unknown> {
  if (!tmdbId) {
    throw new Error("Missing tmdbId")
  }
  const res = await fetch(
    `/api/movies/tmdb-lite?id=${encodeURIComponent(tmdbId)}`
  )
  if (!res.ok) throw new Error("Failed to fetch TMDB movie lite info")
  return res.json() as Promise<unknown>
}

export function useTmdbMovieLiteInfo(tmdbId: string | undefined) {
  return useQuery({
    queryKey: ["tmdbMovieLiteInfo", tmdbId || ""],
    queryFn: () => fetchTmdbMovieLiteInfo(tmdbId || ""),
    enabled: !!tmdbId,
  })
}

async function fetchMovieInfo(movieId: string): Promise<unknown> {
  const data = await fetch(`/api/movies/info?id=${encodeURIComponent(movieId)}`)
  if (!data.ok) throw new Error("Failed to fetch movie info")
  return data.json() as Promise<unknown>
}

export function useMovieInfo(movieId: string) {
  return useQuery({
    queryKey: ["movieInfo", movieId],
    queryFn: () => fetchMovieInfo(movieId),
  })
}

async function fetchTmdbMovieInfo(tmdbId: string): Promise<unknown> {
  if (!tmdbId) {
    throw new Error("Missing tmdbId")
  }
  const res = await fetch(`/api/movies/tmdb?id=${encodeURIComponent(tmdbId)}`)
  if (!res.ok) throw new Error("Failed to fetch TMDB movie info")
  return res.json() as Promise<unknown>
}

export function useTmdbMovieInfo(tmdbId: string | undefined) {
  return useQuery({
    queryKey: ["tmdbMovieInfo", tmdbId || ""],
    queryFn: () => fetchTmdbMovieInfo(tmdbId || ""),
    enabled: !!tmdbId,
  })
}
