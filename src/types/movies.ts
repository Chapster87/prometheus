/**
 * Movie (VOD) category & basic stream types.
 * Extended stream / info types can be appended as needed later.
 */

export type MovieCategory = {
  category_id: string
  category_name: string
  parent_id: number
}

export type MovieStream = {
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
  // Additional fields from external API can be added incrementally.
}

export interface MovieWrapper {
  categoryId: string
  categoryName: string | null
  items: unknown
}
