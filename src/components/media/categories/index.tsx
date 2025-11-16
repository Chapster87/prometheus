import MediaCategoryCard from "./card"
import s from "./styles.module.css"

interface Category {
  category_id: string
  category_name: string
  parent_id: number
}

function resolveTitle(mediaType: string): string {
  const title =
    mediaType === "series" ? "Series Categories" : "Movie Categories"
  return title
}

export default function MediaCategories({
  categories,
  mediaType,
}: {
  categories: Category[]
  mediaType: string
}) {
  // Ensure categories is an array
  if (!Array.isArray(categories)) {
    console.error(
      "Expected categories to be an array, but received:",
      categories
    )
    return <div>Invalid categories data</div>
  }

  return (
    <>
      <h1 className={s.title}>{resolveTitle(mediaType)}</h1>
      <div className={s.mediaCategories}>
        {categories.map((category) => (
          <MediaCategoryCard
            key={category.category_id}
            category={category}
            mediaType={mediaType}
          />
        ))}
      </div>
    </>
  )
}
