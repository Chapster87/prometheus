export interface TmdbLite {
  tmdbId: string
  poster_path?: string
  overview?: string | null
  vote_average?: number
  year?: string
  certification_rating?: string | null
  media_type: "movie" | "tv"
}
