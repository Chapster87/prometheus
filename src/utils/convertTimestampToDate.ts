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
