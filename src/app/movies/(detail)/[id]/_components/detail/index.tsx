import { MovieDetails, TmdbMovieInfo } from "@/types/movies"
import Heading from "@/components/typography/heading"
import Text from "@/components/typography/text"
import Image from "next/image"
import CertRatingBadge from "@/components/badge/cert-rating"

import commonStyles from "@/styles/common.module.css"
import s from "./styles.module.css"

export default function Detail({
  info,
  tmdb,
}: {
  info: MovieDetails["info"]
  tmdb?: TmdbMovieInfo | null
}) {
  const {
    backdrop_path,
    certification_rating,
    release_date,
    genres,
    title,
    overview,
    poster_path,
    status,
    tagline,
    vote_average,
  } = tmdb || {}
  return (
    <div className={s.movieDetail}>
      <div
        className={s.backdrop}
        style={{
          backgroundImage: `url(https://image.tmdb.org/t/p/original${backdrop_path})`,
        }}
      >
        <span className={s.backdropOverlay}></span>
      </div>
      {tmdb && (
        <div className={`${commonStyles.siteContainer} ${s.detailMain}`}>
          <div className={s.posterCol}>
            <MediaPoster
              posterImg={poster_path}
              tagline={tagline}
              name={title || "Movie Title Needed"}
            />
          </div>
          <div className={s.infoPanel}>
            <Heading level="h1">{title}</Heading>
            <GenresList genres={genres || []} />
            <DetailsShelf
              releaseDate={release_date}
              certificationRating={certification_rating}
              status={status}
            />
            {vote_average && vote_average > 0 && (
              <RatingsBadge ratingAvg={vote_average} />
            )}

            <Text>{overview}</Text>
          </div>
        </div>
      )}
    </div>
  )
}

function MediaPoster({
  posterImg,
  tagline,
  name,
}: {
  posterImg?: string | null
  tagline?: string | null
  name: string
}) {
  return (
    <figure className={s.mediaPoster}>
      <Image
        className={s.posterImage}
        src={`https://image.tmdb.org/t/p/w500${posterImg}`}
        alt={name || "No title available"}
        width={500}
        height={750}
      />
      {tagline && (
        <figcaption className={`${s.tagline}`}>{`"${tagline}"`}</figcaption>
      )}
    </figure>
  )
}

function GenresList({ genres }: { genres: { id: number; name: string }[] }) {
  return (
    <div>
      {genres.map((genre, index) => {
        const output =
          index + 1 !== genres.length ? `${genre.name}, ` : genre.name
        return <span key={genre.id}>{output}</span>
      })}
    </div>
  )
}

function DetailsShelf({
  releaseDate,
  certificationRating,
  status,
}: {
  releaseDate?: string | null
  certificationRating?: string | null
  status?: string | null
}) {
  return (
    <div className={s.detailShelf}>
      {releaseDate && (
        <div className={s.shelfItem}>
          <Text>{releaseDate.slice(0, 4)}</Text>
        </div>
      )}
      {certificationRating && (
        <div className={s.shelfItem}>
          <CertRatingBadge rating={certificationRating || null} />
        </div>
      )}
      {status && (
        <div className={s.shelfItem}>
          <Text className={s.mediaStatus}>Status: {status}</Text>
        </div>
      )}
    </div>
  )
}

function RatingsBadge({ ratingAvg }: { ratingAvg: number }) {
  return (
    <div className={`${s.ratingAndMatrix}`}>
      <div className={`${s.ratingAndMatrixInner}`}>
        <div className={`${s.communityRating}`}>
          <Image
            src={`/tmdb-short.svg`}
            alt="TMDB Rating"
            width={65}
            height={28}
          />
          <Text className={s.ratingAverage}>
            {(Math.round(ratingAvg * 10) / 10).toFixed(1)}
          </Text>
        </div>
      </div>
    </div>
  )
}
