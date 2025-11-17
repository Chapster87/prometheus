"use client"

import { useMovieInfo, useTmdbMovieInfo } from "@/client/query/moviesHooks"
import Detail from "./_components/detail"

import { MovieDetails, TmdbMovieInfo } from "@/types/movies"

interface Props {
  movieId: string
  tmdbId?: string
}

export default function MovieClient({ movieId, tmdbId }: Props) {
  const {
    data: xcData,
    isLoading: xcLoading,
    error: xcError,
  } = useMovieInfo(movieId)
  const {
    data: tmdbData,
    isLoading: tmdbLoading,
    error: tmdbError,
  } = useTmdbMovieInfo(tmdbId)
  const { info } = (xcData as MovieDetails) || {}
  const tmdb = (tmdbData as TmdbMovieInfo) || null

  if (!tmdbLoading) {
    console.log("MovieClient render", { movieId, tmdbId, xcData, tmdbData })
  }
  return (
    <>
      {xcLoading && <p>Loading movie...</p>}
      {xcError && <p>Error loading movie.</p>}
      {!xcLoading && !xcError && (
        <>
          {tmdbLoading && <p>Loading TMDB supplemental data...</p>}
          {tmdbError ? <p>Failed to load TMDB data.</p> : null}
          <Detail info={info} tmdb={tmdb} />
        </>
      )}
    </>
  )
}
