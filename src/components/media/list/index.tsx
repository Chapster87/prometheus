import MediaCard from "@/components/media/card"
import s from "./styles.module.css"
import { Series } from "@/types/series"

export interface MediaListData {
  categoryName: string
  items: Series[]
}

export default function MediaList({ mediaData }: { mediaData: MediaListData }) {
  console.log("MediaList mediaData:", mediaData)
  const { categoryName, items } = mediaData || {}

  return (
    <>
      <h1 className={s.title}>{categoryName}</h1>
      {items && items.length > 0 ? (
        items.map((item) => (
          <div key={item.num} className={s.cardContainer}>
            <MediaCard cardData={item} />
          </div>
        ))
      ) : (
        <p>No media items found.</p>
      )}
    </>
  )
}
