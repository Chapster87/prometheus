import Link from "@/components/link"
import s from "./styles.module.css"

interface MediaCategoryCardProps {
  category: {
    category_id: string
    category_name: string
    parent_id: number
  }
  mediaType: string
}

export default function MediaCategoryCard({
  category,
  mediaType,
}: MediaCategoryCardProps) {
  const { category_id, category_name } = category
  return (
    <Link
      href={`/${mediaType.toLowerCase()}/category/${category_id}`}
      className={s.card}
    >
      <h3 className={s.name}>{category_name}</h3>
      <p className={s.id}>ID: {category_id}</p>
    </Link>
  )
}
