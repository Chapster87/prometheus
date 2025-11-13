import MediaCategoryCard from "./card"
import s from "./styles.module.css"

interface Category {
  category_id: string
  category_name: string
  parent_id: number
}

export default function MediaCategories({
  categories,
}: {
  categories: Category[]
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
      <h1 className={s.title}>Series Categories</h1>
      <div className={s.mediaCategories}>
        {categories.map((category) => (
          <MediaCategoryCard key={category.category_id} category={category} />
        ))}
      </div>
    </>
  )
}
