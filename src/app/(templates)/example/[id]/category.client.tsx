"use client"

import { useSeriesBatch } from "@/client/query/hooks"

interface Props {
  categories: string[]
}

export default function SeriesClient({ categories }: Props) {
  const { data, isLoading, error } = useSeriesBatch(categories)

  return (
    <>
      {isLoading && <p>Loading series...</p>}
      {error && <p>Error loading series.</p>}
      {!isLoading && !error && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </>
  )
}
