"use client"

import { useSeriesBatch } from "@/client/query/hooks"
import MediaList from "@/components/media/list"
import { MediaListData } from "@/components/media/list"

interface Props {
  categories: string[]
}

export default function SeriesClient({ categories }: Props) {
  const { data, isLoading, error } = useSeriesBatch(categories)

  return (
    <>
      {isLoading && <p>Loading series...</p>}
      {error && <p>Error loading series.</p>}
      {!isLoading && !error && <MediaList mediaData={data as MediaListData} />}
    </>
  )
}
