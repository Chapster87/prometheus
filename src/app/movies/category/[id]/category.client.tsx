"use client"

import { useMoviesBatch } from "@/client/query/moviesHooks"
import MediaList from "@/components/media/list"
import type { Series } from "@/types/series"
import type { Movie } from "@/types/movies"

interface Props {
  categories: string[]
}

interface MovieWrapper {
  categoryName: string
  items: Movie[]
  categoryId?: string
}

/**
 * Movies category client mirrors series category client methodology.
 * Accepts a categories array (currently single entry) and normalizes
 * either a single wrapper or batch map response into MediaListData.
 */
export default function MoviesCategoryClient({ categories }: Props) {
  const { data, isLoading, error } = useMoviesBatch(categories)
  const categoryId = categories[0]

  // Normalize payload
  let mediaPayload: {
    categoryName: string
    items: (Series | Movie)[]
    mediaType: "movies"
  } | null = null

  if (data) {
    // Single-category response (server unwrapped)
    if (Object.prototype.hasOwnProperty.call(data as MovieWrapper, "items")) {
      const wrapper = data as MovieWrapper
      mediaPayload = {
        categoryName: wrapper.categoryName || `Category ${categoryId}`,
        items: (wrapper.items as (Series | Movie)[]) || [],
        mediaType: "movies",
      }
    } else {
      // Batch map response
      const batch = data as Record<string, MovieWrapper>
      const wrapper = batch[categoryId]
      if (wrapper) {
        mediaPayload = {
          categoryName: wrapper.categoryName || `Category ${categoryId}`,
          items: (wrapper.items as (Series | Movie)[]) || [],
          mediaType: "movies",
        }
      }
    }
  }

  return (
    <>
      {isLoading && <p>Loading movies...</p>}
      {error && <p>Error loading movies.</p>}
      {!isLoading && !error && mediaPayload && (
        <MediaList mediaData={mediaPayload} />
      )}
    </>
  )
}
