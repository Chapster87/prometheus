import Text from "@/components/typography/text"
import Button from "@/components/button"
import { ArrowDownAZ, ClockArrowDown, SquareCode } from "lucide-react"
import s from "./styles.module.css"

export interface MoviesSortControlsProps {
  value: string
  onValueChange: (value: string) => void
}

/**
 * MoviesSort
 * Controls-only component for selecting movies sort mode.
 * Options: original-order, alphanumeric, added
 */
export default function MoviesSort({
  value,
  onValueChange,
}: MoviesSortControlsProps) {
  const sortOptions = [
    { value: "added", label: "Recently Added", icon: <ClockArrowDown /> },
    { value: "alphanumeric", label: "Alphanumeric", icon: <ArrowDownAZ /> },
    {
      value: "original-order",
      label: "Data Source Order",
      icon: <SquareCode />,
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
