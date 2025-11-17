export type MovieCategory = {
  category_id: string
  category_name: string
  parent_id: number
}

export type Movie = {
  num: number
  name: string
  title: string
  stream_type: string
  stream_id: number
  stream_icon: string
  rating: string
  rating_5based: number
  added: string
  is_adult: string
  category_id: string
  container_extension: string
  custom_sid: string
  direct_source: string
}

export interface MovieInfo {
  name: string
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
  tmdb_id: number
  youtube_trailer: string
  episode_run_time: string
  category_id: string
  category_ids: number[]
}

export interface VideoDetails {
  index: number
  codec_name: string
  codec_long_name: string
  profile: string
  codec_type: string
  codec_tag_string: string
  codec_tag: string
  width: number
  height: number
  coded_width: number
  coded_height: number
  closed_captions: number
  film_grain: number
  has_b_frames: number
  sample_aspect_ratio: string
  display_aspect_ratio: string
  pix_fmt: string
  level: number
  color_range: string
  color_space: string
  color_transfer: string
  color_primaries: string
  chroma_location: string
  field_order: string
  refs: number
  is_avc: string
  nal_length_size: string
  r_frame_rate: string
  avg_frame_rate: string
  time_base: string
  start_pts: number
  start_time: string
  bits_per_raw_sample: string
  extradata_size: number
  disposition: Disposition
  tags: Tags
}

export interface AudioDetails {
  index: number
  codec_name: string
  codec_long_name: string
  codec_type: string
  codec_tag_string: string
  codec_tag: string
  sample_fmt: string
  sample_rate: string
  channels: number
  channel_layout: string
  bits_per_sample: number
  r_frame_rate: string
  avg_frame_rate: string
  time_base: string
  start_pts: number
  start_time: string
  bit_rate: string
  disposition: Disposition
  tags: Tags
}

export interface Disposition {
  default: number
  dub: number
  original: number
  comment: number
  lyrics: number
  karaoke: number
  forced: number
  hearing_impaired: number
  visual_impaired: number
  clean_effects: number
  attached_pic: number
  timed_thumbnails: number
  captions: number
  descriptions: number
  metadata: number
  dependent: number
  still_image: number
}

export interface Tags {
  language?: string
  BPS?: string
  DURATION?: string
  NUMBER_OF_FRAMES?: string
  NUMBER_OF_BYTES?: string
  _STATISTICS_WRITING_APP?: string
  _STATISTICS_TAGS?: string
}

export interface MovieDetails {
  info: MovieInfo
}

/**
 * TMDB movie info shape (expanded to match /movie/{id} with append_to_response fields)
 */
export interface TmdbMovieInfo {
  adult?: boolean
  backdrop_path?: string | null
  belongs_to_collection?: Record<string, unknown> | null
  budget?: number
  genres?: { id: number; name: string }[]
  homepage?: string | null
  id?: number
  imdb_id?: string | null
  original_language?: string
  original_title?: string
  overview?: string | null
  popularity?: number
  poster_path?: string | null
  production_companies?: {
    id: number
    logo_path: string | null
    name: string
    origin_country: string
  }[]
  production_countries?: { iso_3166_1: string; name: string }[]
  release_date?: string
  revenue?: number
  runtime?: number | null
  spoken_languages?: {
    english_name: string
    iso_639_1: string
    name: string
  }[]
  status?: string
  tagline?: string | null
  title?: string
  video?: boolean
  vote_average?: number
  vote_count?: number
  certification_rating?: string | null
  trailers?: { key: string; site: string; type: string }[]
  media_type?: string
}
