import Link from "@/components/link"
import Image from "next/image"
import Heading from "@/components/typography/heading"
import Text from "@/components/typography/text"
import { Series } from "@/types/series"
import s from "./styles.module.css"

export default function MediaCard({ mediaData }: { mediaData: Series }) {
  const { name, cover, plot } = mediaData
  return (
    <div className={s.mediaCard}>
      {cover && (
        <Link href={`/series/${mediaData.series_id}`}>
          <figure className={s.imageWrapper}>
            <Image
              src={cover}
              alt={name}
              width={256}
              height={376}
              className={s.mediaImage}
            />
          </figure>
        </Link>
      )}
      <div className={`${s.mediaInfo} ${!cover ? s.noCover : ""}`}>
        <Link href={`/series/${mediaData.series_id}`}>
          <Heading level="h3" className={s.mediaTitle}>
            {name}
          </Heading>
        </Link>
        <Text className={s.mediaPlot}>{plot}</Text>
        <Link
          href={`/series/${mediaData.series_id}`}
          className={s.viewDetailsLink}
        >
          View Details
        </Link>
      </div>
    </div>
  )
}
