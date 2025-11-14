import MediaCard from "@/components/media/card"
import { Series } from "@/types/series"
import { useState } from "react"
import { ArrowDownAZ, CalendarArrowDown, ClockArrowDown } from "lucide-react"
import Text from "@/components/typography/text"
import Button from "@/components/button"

import s from "./styles.module.css"

export interface MediaListData {
  categoryName: string
  items: Series[]
}

export default function MediaList({ mediaData }: { mediaData: MediaListData }) {
  const { categoryName, items } = mediaData || {}
  const [sortOption, setSortOption] = useState("last-modified")

  // Add fallback for empty or undefined mediaData
  if (!mediaData || !mediaData.items || mediaData.items.length === 0) {
    return <p>Loading media items...</p>
  }

  const sortedItems = items?.slice().sort((a, b) => {
    if (sortOption === "alphanumeric") {
      return a.name.localeCompare(b.name)
    } else if (sortOption === "last-modified") {
      return Number(b.last_modified) - Number(a.last_modified)
    } else if (sortOption === "release-date") {
      return (
        new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
      )
    }
    return 0
  })

  return (
    <div className={s.mediaListWrapper}>
      <h1 className={s.title}>{categoryName}</h1>
      <div className={s.listHeader}>
        <Sort value={sortOption} onValueChange={setSortOption} />
      </div>
      {sortedItems && sortedItems.length > 0 ? (
        <div className={s.mediaList}>
          {sortedItems.map((item) => (
            <div key={item.num} className={s.cardContainer}>
              <MediaCard mediaData={item} />
            </div>
          ))}
        </div>
      ) : (
        <p>No media items found.</p>
      )}
    </div>
  )
}

function Sort({
  value,
  onValueChange,
}: {
  value: string
  onValueChange: (value: string) => void
}) {
  const sortOptions = [
    {
      value: "last-modified",
      label: "Last Modified",
      icon: <ClockArrowDown />,
    },
    { value: "alphanumeric", label: "Alphanumeric", icon: <ArrowDownAZ /> },
    {
      value: "release-date",
      label: "Release Date",
      icon: <CalendarArrowDown />,
    },
  ]

  return (
    <div className={s.sortControl}>
      <Text className={s.sortLabel}>
        <strong>Sort:</strong>
      </Text>
      {sortOptions.map((option) => (
        <Button
          key={option.value}
          className={`${s.sortButton} ${
            value === option.value ? s.activeSortButton : ""
          }`}
          onClick={() => onValueChange(option.value)}
          aria-label={`Sort by ${option.label}`}
          size="small"
          beforeText={option.icon}
        >
          <span className={s.sortButtonLabel}>{option.label}</span>
        </Button>
      ))}
    </div>
  )
}
