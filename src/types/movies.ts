/**
 * Movie (VOD) category & basic stream types.
 * Extended stream / info types can be appended as needed later.
 */
export type MovieCategory = {
  category_id: string
  category_name: string
  parent_id: number
}

export type Movie = {
  stream_id: string
  name?: string
  title?: string
  year?: string
  category_id?: string
  rating?: string
  rating_5based?: string
  tmdb?: string
  added?: string
  container_extension?: string
  // Additional optional fields encountered in external API responses:
  cover?: string
  stream_icon?: string
  poster?: string
  plot?: string
  description?: string
  overview?: string
  release_date?: string
  last_modified?: string
}

export interface MovieWrapper {
  categoryId: string
  categoryName: string | null
  items: unknown
}
