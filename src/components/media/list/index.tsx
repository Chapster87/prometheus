import MediaCard from "@/components/media/card"
import { Series } from "@/types/series"
import { Movie } from "@/types/movies"
import { useState } from "react"
import SeriesSort from "./_components/sort/series"
import MoviesSort from "./_components/sort/movies"

import s from "./styles.module.css"

type MediaItem = Series | Movie

export interface MediaListData {
  categoryName: string
  items: MediaItem[]
  mediaType: "series" | "movies"
}

export default function MediaList({ mediaData }: { mediaData: MediaListData }) {
  const { categoryName, items, mediaType } = mediaData || {}
  const [sortOption, setSortOption] = useState(
    mediaType === "series" ? "last-modified" : "added"
  )

  if (!items || items.length === 0) {
    return <p>Loading media items...</p>
  }

  console.log("MediaList items:", items)

  const sortedItems =
    sortOption === "original-order"
      ? items
      : items.slice().sort((a: MediaItem, b: MediaItem) => {
          if (sortOption === "alphanumeric") {
            const aTitle =
              (mediaType === "series"
                ? (a as Series).name
                : (a as Movie).title || (a as Movie).name) || ""
            const bTitle =
              (mediaType === "series"
                ? (b as Series).name
                : (b as Movie).title || (b as Movie).name) || ""
            return aTitle.localeCompare(bTitle)
          }

          if (mediaType === "series") {
            const seriesA = a as Series
            const seriesB = b as Series
            if (sortOption === "last-modified") {
              const aMod = Number(seriesA.last_modified || 0)
              const bMod = Number(seriesB.last_modified || 0)
              return bMod - aMod
            } else if (sortOption === "release-date") {
              const aDate = seriesA.releaseDate || seriesA.release_date || ""
              const bDate = seriesB.releaseDate || seriesB.release_date || ""
              return (
                new Date(bDate || 0).getTime() - new Date(aDate || 0).getTime()
              )
            }
          } else {
            // movies-specific
            const movieA = a as Movie
            const movieB = b as Movie
            if (sortOption === "added") {
              const aAdded = Number(movieA.added || 0)
              const bAdded = Number(movieB.added || 0)
              return bAdded - aAdded
            }
          }

          return 0
        })

  return (
    <div className={s.mediaListWrapper}>
      <h1 className={s.title}>{categoryName}</h1>
      <div className={s.listHeader}>
        {mediaType === "series" ? (
          <SeriesSort value={sortOption} onValueChange={setSortOption} />
        ) : (
          <MoviesSort value={sortOption} onValueChange={setSortOption} />
        )}
      </div>
      {sortedItems.length > 0 ? (
        <div className={s.mediaList}>
          {sortedItems.map((item: MediaItem) => {
            const key =
              mediaType === "series"
                ? (item as Series).num
                : (item as Movie).stream_id
            return (
              <div key={key} className={s.cardContainer}>
                <MediaCard mediaType={mediaType} media={item} />
              </div>
            )
          })}
        </div>
      ) : (
        <p>No media items found.</p>
      )}
    </div>
  )
}
