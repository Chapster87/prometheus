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

function resolveMediaDetails({
  media,
  mediaType,
  tmdbData,
  tmdbLoading,
}: {
  media: Series | Movie
  mediaType: "series" | "movies"
  tmdbData: TmdbLite | undefined
  tmdbLoading: boolean
}) {
  // --- Title ---
  const titleFromMedia =
    (isSeries(media) ? media.name : media.title || media.name) || ""
  const titleFromTmdb =
    !tmdbLoading && tmdbData
      ? (isSeries(media)
          ? `${tmdbData.name} (${tmdbData.year})`
          : `${tmdbData.title} (${tmdbData.year})`) || ""
      : ""
  const title = titleFromTmdb || titleFromMedia || "Untitled"

  // --- Plot ---
  const plotFromMedia =
    (isSeries(media)
      ? media.plot
      : media.plot || media.description || media.overview) || ""
  const plotFromTmdb = (!tmdbLoading && tmdbData?.overview) || ""
  const plot = plotFromTmdb || plotFromMedia

  // --- Cover ---
  const coverFromMedia =
    (isSeries(media)
      ? media.cover
      : media.cover || media.stream_icon || media.poster) || null
  const coverFromTmdb =
    !tmdbLoading && tmdbData?.poster_path
      ? `https://image.tmdb.org/t/p/original/${tmdbData.poster_path}`
      : null
  const cover = coverFromTmdb || coverFromMedia

  // --- Href ---
  const href =
    mediaType === "series"
      ? `/series/${(media as Series).series_id}`
      : `/movies/${(media as Movie).stream_id}`

  return { title, plot, cover, href }
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
  const tmdbLoading =
    mediaType === "series" ? seriesLite.isLoading : movieLite.isLoading

  const { title, plot, cover, href } = resolveMediaDetails({
    media,
    mediaType,
    tmdbData,
    tmdbLoading,
  })

  return (
    <div className={s.mediaCard}>
      {cover && (
        <Link href={href}>
          <figure className={s.imageWrapper}>
            <Image
              src={cover}
              alt={title}
              width={2000}
              height={3000}
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
