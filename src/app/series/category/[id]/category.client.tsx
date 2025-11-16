"use client"

import { useSeriesBatch } from "@/client/query/seriesHooks"
import MediaList from "@/components/media/list"
import type { Series } from "@/types/series"

interface Props {
  categories: string[]
}

export default function SeriesClient({ categories }: Props) {
  const { data, isLoading, error } = useSeriesBatch(categories)
  // Normalize single wrapper vs batch map
  const categoryId = categories[0]
  interface SeriesWrapper {
    categoryName: string
    items: Series[]
    categoryId?: string
  }

  function isSeriesWrapper(obj: unknown): obj is SeriesWrapper {
    return (
      !!obj &&
      typeof obj === "object" &&
      "items" in obj &&
      "categoryName" in obj
    )
  }

  let mediaPayload: {
    categoryName: string
    items: Series[]
    mediaType: "series"
  } | null = null

  if (data) {
    if (isSeriesWrapper(data)) {
      mediaPayload = {
        categoryName: data.categoryName || `Category ${categoryId}`,
        items: data.items || [],
        mediaType: "series",
      }
    } else {
      const batch = data as Record<string, SeriesWrapper>
      const wrapper = batch[categoryId]
      if (wrapper) {
        mediaPayload = {
          categoryName: wrapper.categoryName || `Category ${categoryId}`,
          items: wrapper.items || [],
          mediaType: "series",
        }
      }
    }
  }

  return (
    <>
      {isLoading && <p>Loading series...</p>}
      {error && <p>Error loading series.</p>}
      {!isLoading && !error && mediaPayload && (
        <MediaList mediaData={mediaPayload} />
      )}
    </>
  )
}
