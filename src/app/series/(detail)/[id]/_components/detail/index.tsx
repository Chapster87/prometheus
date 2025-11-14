import { useState } from "react"
import { SeriesDetails, TmdbSeriesInfo } from "@/types/series"
import Heading from "@/components/typography/heading"
import Text from "@/components/typography/text"
import Image from "next/image"
import CertRatingBadge from "@/components/badge/cert-rating"

import commonStyles from "@/styles/common.module.css"
import s from "./styles.module.css"

export default function Detail({
  seasons,
  info,
  episodes,
  tmdb,
  tmdbLoading,
  tmdbError,
}: SeriesDetails & {
  tmdb?: TmdbSeriesInfo | null
  tmdbLoading: boolean
  tmdbError: boolean
}) {
  const [ermOpen, setErmOpen] = useState(false)
  const {
    backdrop_path,
    certification_rating,
    first_air_date,
    genres,
    name,
    poster_path,
    status,
    tagline,
    vote_average,
  } = tmdb || {}
  return (
    <div className={s.seriesDetail}>
      <div
        className={s.backdrop}
        style={{
          backgroundImage: `url(https://image.tmdb.org/t/p/original${backdrop_path})`,
        }}
      >
        <span className={s.backdropOverlay}></span>
      </div>
      {tmdbLoading && <p>Loading TMDB supplemental data...</p>}
      {tmdbError ? <p>Failed to load TMDB data.</p> : null}
      {tmdb && (
        <div className={`${commonStyles.siteContainer} ${s.detailMain}`}>
          <div className={s.posterCol}>
            <MediaPoster
              posterImg={poster_path}
              tagline={tagline}
              name={name || "Series Title Needed"}
            />
          </div>
          <div className={s.infoPanel}>
            <Heading level="h1">{name}</Heading>
            <GenresList genres={genres || []} />
            <div className={s.detailShelf}>
              {first_air_date && (
                <div className={s.shelfItem}>
                  <Text>{first_air_date.slice(0, 4)}</Text>
                </div>
              )}
              {certification_rating && (
                <div className={s.shelfItem}>
                  <CertRatingBadge rating={certification_rating || null} />
                </div>
              )}
              {status && (
                <div className={s.shelfItem}>
                  <Text className={s.mediaStatus}>Status: {status}</Text>
                </div>
              )}
            </div>
            {vote_average && vote_average > 0 && (
              <div className={`${s.ratingAndMatrix} ${ermOpen ? s.open : ""}`}>
                <div className={`${s.ratingAndMatrixInner}`}>
                  <div className={`${s.communityRating}`}>
                    <Image
                      src={`/tmdb-short.svg`}
                      alt="TMDB Rating"
                      width={65}
                      height={28}
                    />
                    <Text className={s.ratingAverage}>
                      {(Math.round(vote_average * 10) / 10).toFixed(1)}
                    </Text>
                  </div>
                  {!ermOpen ? (
                    <button
                      className="btn btn-sm btn-outline btn-primary"
                      onClick={() => setErmOpen(true)}
                    >
                      View Episode Rating Matrix
                    </button>
                  ) : (
                    <button
                      className="btn btn-sm btn-outline btn-primary"
                      onClick={() => setErmOpen(false)}
                    >
                      Close Episode Rating Matrix
                    </button>
                  )}
                </div>

                {/* <div className="rating-matrix-outer relative">
                  <div className='absolute'>
                    <EpisodeRatingMatrix seasons={mediaData.seasons} />
                  </div>
                </div> */}
              </div>
            )}

            <Text>{tmdb.overview}</Text>
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
