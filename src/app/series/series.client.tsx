"use client"

import { useSeriesCategories } from "@/client/query/hooks"
import MediaCategories from "@/components/media/categories"

interface Category {
  category_id: string
  category_name: string
  parent_id: number
}

export default function SeriesClient() {
  const { data, isLoading, error } = useSeriesCategories()

  const categories: Category[] =
    Array.isArray(data) &&
    data.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        "category_id" in item &&
        "category_name" in item &&
        "parent_id" in item
    )
      ? (data as Category[])
      : []

  return (
    <>
      {isLoading && <p>Loading categories...</p>}
      {error && <p>Error loading categories.</p>}
      {!isLoading && !error && categories.length > 0 && (
        <MediaCategories categories={categories} />
      )}
    </>
  )
}
