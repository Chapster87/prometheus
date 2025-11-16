"use client"
import Link from "@/components/link"
import Image from "next/image"
import Heading from "@/components/typography/heading"
import Text from "@/components/typography/text"
import { Series } from "@/types/series"
import { Movie } from "@/types/movies"
import { useTmdbSeriesLiteInfo } from "@/client/query/seriesHooks"
import { useTmdbMovieLiteInfo } from "@/client/query/moviesHooks"
import { TmdbLite } from "@/types/tmdbLite"
import s from "./styles.module.css"

type MediaCardProps = {
  mediaType: "series" | "movies"
  media: Series | Movie
}

function isSeries(m: Series | Movie): m is Series {
  return (m as Series).series_id !== undefined
}

function isMovie(m: Series | Movie): m is Movie {
  return (m as Movie).stream_id !== undefined
}

function resolveTitle(media: Series | Movie): string {
  if (isSeries(media) && media.name) return media.name
  if (isMovie(media)) {
    if (media.title) return media.title
    if (media.name) return media.name
  }
  return "Untitled"
}

function resolvePlot(media: Series | Movie): string {
  if (isSeries(media) && media.plot) return media.plot
  if (isMovie(media)) {
    return media.plot || media.description || media.overview || ""
  }
  return ""
}

function resolveCover(media: Series | Movie): string | null {
  if (isSeries(media) && media.cover) return media.cover
  if (isMovie(media)) {
    return media.cover || media.stream_icon || media.poster || null
  }
  return null
}

function resolveHref(
  mediaType: "series" | "movies",
  media: Series | Movie
): string {
  return mediaType === "series"
    ? `/series/${(media as Series).series_id}`
    : `/movies/${(media as Movie).stream_id}`
}

export default function MediaCard({ mediaType, media }: MediaCardProps) {
  const tmdbId = (media as { tmdb?: string }).tmdb
  const seriesLite = useTmdbSeriesLiteInfo(
    mediaType === "series" ? tmdbId : undefined
  )
  const movieLite = useTmdbMovieLiteInfo(
    mediaType === "movies" ? tmdbId : undefined
  )
  const tmdbData = (
    mediaType === "series" ? seriesLite.data : movieLite.data
  ) as TmdbLite | undefined

  const title = resolveTitle(media)

  let plot = resolvePlot(media)
  if (!plot && tmdbData && (tmdbData as TmdbLite).overview) {
    plot = (tmdbData as TmdbLite).overview || ""
  }

  let cover = resolveCover(media)
  if (!cover && tmdbData && (tmdbData as TmdbLite).poster_path) {
    cover = `https://image.tmdb.org/t/p/w342${
      (tmdbData as TmdbLite).poster_path
    }`
  }

  const href = resolveHref(mediaType, media)

  return (
    <div className={s.mediaCard}>
      {cover && (
        <Link href={href}>
          <figure className={s.imageWrapper}>
            <Image
              src={cover}
              alt={title}
              width={256}
              height={376}
              className={s.mediaImage}
            />
          </figure>
        </Link>
      )}
      <div className={`${s.mediaInfo} ${!cover ? s.noCover : ""}`}>
        <Link href={href}>
          <Heading level="h3" className={s.mediaTitle}>
            {title}
          </Heading>
        </Link>
        {plot && <Text className={s.mediaPlot}>{plot}</Text>}
        <Link href={href} className={s.viewDetailsLink}>
          View Details
        </Link>
      </div>
    </div>
  )
}
