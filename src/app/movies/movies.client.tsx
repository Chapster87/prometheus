"use client"

import { useMovieCategories } from "@/client/query/moviesHooks"
import type { MovieCategory } from "@/types/movies"
import MediaCategories from "@/components/media/categories"

const MEDIA_TYPE = "Movie"

export default function MoviesClient() {
  const { data, isLoading, error } = useMovieCategories()

  const categories: MovieCategory[] =
    Array.isArray(data) &&
    data.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        "category_id" in item &&
        "category_name" in item &&
        "parent_id" in item
    )
      ? (data as MovieCategory[])
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
