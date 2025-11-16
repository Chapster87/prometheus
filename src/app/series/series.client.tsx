"use client"

import { useSeriesCategories } from "@/client/query/seriesHooks"
import { SeriesCategory } from "@/types/series"
import MediaCategories from "@/components/media/categories"

const MEDIA_TYPE = "series"

export default function SeriesClient() {
  const { data, isLoading, error } = useSeriesCategories()

  const categories: SeriesCategory[] =
    Array.isArray(data) &&
    data.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        "category_id" in item &&
        "category_name" in item &&
        "parent_id" in item
    )
      ? (data as SeriesCategory[])
      : []

  return (
    <>
      {isLoading && <p>Loading categories...</p>}
      {error && <p>Error loading categories.</p>}
      {!isLoading && !error && categories.length > 0 && (
        <MediaCategories categories={categories} mediaType={MEDIA_TYPE} />
      )}
    </>
  )
}
