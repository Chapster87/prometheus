"use client"

import { useSeriesInfo, useTmdbSeriesInfo } from "@/client/query/hooks"
import Detail from "./_components/detail"

import { SeriesDetails, TmdbSeriesInfo } from "@/types/series"

interface Props {
  seriesId: string
  tmdbId?: string
}

export default function SeriesClient({ seriesId, tmdbId }: Props) {
  const {
    data: xcData,
    isLoading: xcLoading,
    error: xcError,
  } = useSeriesInfo(seriesId)
  const {
    data: tmdbData,
    isLoading: tmdbLoading,
    error: tmdbError,
  } = useTmdbSeriesInfo(tmdbId)
  const { seasons, info, episodes } = (xcData as SeriesDetails) || {}
  const tmdb = (tmdbData as TmdbSeriesInfo) || null

  console.log("SeriesClient render", { seriesId, tmdbId, xcData, tmdbData })
  return (
    <>
      {xcLoading && <p>Loading series...</p>}
      {xcError && <p>Error loading series.</p>}
      {!xcLoading && !xcError && (
        <>
          {tmdbLoading && <p>Loading TMDB supplemental data...</p>}
          {tmdbError ? <p>Failed to load TMDB data.</p> : null}
          <Detail
            seasons={seasons}
            info={info}
            episodes={episodes}
            tmdb={tmdb}
          />
        </>
      )}
    </>
  )
}
