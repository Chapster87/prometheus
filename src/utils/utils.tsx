export function optimizeName(name: string): string {
  name = name
    .replace("\r", "")
    .replace(
      /(-\s*\d{2,4})|vod|fhd|hd|360p|4k|h264|h265|24fps|60fps|720p|1080p|vod|x264|x265|\.avi|\.mp4|\.mkv|\[.*]|\(.*\)|\{.*\}|-|_|\./gim,
      " "
    )
    .replace(/(- \d\d\d\d$)/, "")
  name = name.replace("   ", " ")
  name = name.replace("  ", " ")
  return name.trim()
}

export const percentageToHsl: PercentageToHsl = (percentage) => {
  const green = 120
  const red = 0
  const hue0 = red
  const hue1 = green
  const hue = percentage * (hue1 - hue0) + hue0
  return "hsl(" + hue + ", 100%, 50%)"
}

interface PercentageToHsl {
  (percentage: number): string
}

export function minutesToHrs(totalMinutes: number): string {
  const hours: number = Math.floor(totalMinutes / 60)
  const minutes: number = totalMinutes % 60

  const finalTime: string = (hours > 0 ? hours + " Hr " : "") + minutes + " Min"

  return finalTime
}

export function secondsToHms(d: number): string {
  d = Number(d)
  const h: number = Math.floor(d / 3600)
  const m: number = Math.floor((d % 3600) / 60)
  const s: number = Math.floor((d % 3600) % 60)
  return `${h}:${m < 10 ? `0${m}` : m}:${s < 10 ? `0${s}` : s}`
}

interface IsFutureDate {
  (date: Date): boolean
}

export const isFutureDate: IsFutureDate = (date) => {
  const dateToCheck = new Date(date)
  const today = new Date()
  return dateToCheck > today
}

/**
 * Converts a Unix timestamp (in seconds) to a standard date string.
 * @param {number} timestamp - The Unix timestamp to convert.
 * @returns {string} - The formatted date string in ISO format.
 */
export function convertTimestampToDate(timestamp: number): string {
  // Convert the timestamp to milliseconds and create a Date object
  const date = new Date(timestamp * 1000)

  // Return the date in ISO format
  return date.toISOString()
}
