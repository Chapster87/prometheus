import s from "./styles.module.css"

export default function CertRatingBadge({
  rating,
  theme,
}: {
  rating: string | null
  theme?: "dark" | "light"
}) {
  if (!rating) return null

  return (
    <div className={`${s.certRatingBadge} ${theme === "dark" ? s.dark : ""}`}>
      {rating}
    </div>
  )
}
