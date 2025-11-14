export type SeriesCategory = {
  category_id: string
  category_name: string
  parent_id: number
}

export type Series = {
  num: number
  name: string
  series_id: number
  cover: string
  plot: string
  cast: string
  director: string
  genre: string
  releaseDate: string
  release_date: string
  last_modified: string
  rating: string
  rating_5based: string
  backdrop_path: string[]
  youtube_trailer: string
  tmdb: string
  episode_run_time: string
  category_id: string
  category_ids: number[]
}
