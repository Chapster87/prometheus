import Link from "@/components/link"
import { Series } from "@/types/series"

export default function MediaCard({ cardData }: { cardData: Series }) {
  const { name } = cardData
  return (
    <Link href={`/series/${cardData.series_id}`} className="media-card">
      <div>{name}</div>
    </Link>
  )
}
