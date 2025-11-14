"use client"

import { useSeriesInfo } from "@/client/query/hooks"

interface Props {
  seriesId: string
}

export default function SeriesClient({ seriesId }: Props) {
  const { data, isLoading, error } = useSeriesInfo(seriesId)

  return (
    <>
      {isLoading && <p>Loading series...</p>}
      {error && <p>Error loading series.</p>}
      {!isLoading && !error && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </>
  )
}
