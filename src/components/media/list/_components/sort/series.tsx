import Text from "@/components/typography/text"
import Button from "@/components/button"
import {
  ArrowDownAZ,
  ClockArrowDown,
  CalendarArrowDown,
  SquareCode,
} from "lucide-react"
import s from "./styles.module.css"

export interface SeriesSortControlsProps {
  value: string
  onValueChange: (value: string) => void
}

/**
 * SeriesSort
 * Controls-only component for selecting series sort mode.
 * Options: original-order, alphanumeric, last-modified, release-date
 */
export default function SeriesSort({
  value,
  onValueChange,
}: SeriesSortControlsProps) {
  const sortOptions = [
    {
      value: "last-modified",
      label: "Last Modified",
      icon: <ClockArrowDown />,
    },

    { value: "alphanumeric", label: "Alphanumeric", icon: <ArrowDownAZ /> },
    ,
    {
      value: "release-date",
      label: "Release Date",
      icon: <CalendarArrowDown />,
    },
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
