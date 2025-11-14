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

// Define types for the series details data structure

export interface Season {
  name: string
  episode_count: string
  overview: string
  air_date: string
  cover: string
  cover_tmdb: string
  season_number: number
  cover_big: string
  releaseDate: string
  duration: string
}

export interface SeriesInfo {
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
  tmdb: string
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

export interface EpisodeInfo {
  movie_image_tmdb: string
  movie_image: string
  plot: string
  rating: string
  releasedate: string
  tmdb_id: string
  duration_secs: number
  duration: string
  video: VideoDetails
  audio: AudioDetails
  bitrate: number
}

export interface Episode {
  id: string
  episode_num: number
  title: string
  container_extension: string
  info: EpisodeInfo
  custom_sid: string | null
  added: string
  season: number
  direct_source: string
}

export interface Episodes {
  [season: string]: Episode[]
}

export interface SeriesDetails {
  seasons: Season[]
  info: SeriesInfo
  episodes: Episodes
}

/**
 * TMDB series (TV show) info shape (expanded to match /tv/{id} with append_to_response fields)
 */
export interface TmdbPersonCredit {
  id?: number
  credit_id?: string
  name?: string
  original_name?: string
  gender?: number | null
  profile_path?: string | null
  adult?: boolean
  known_for_department?: string
  popularity?: number
  job?: string
  department?: string
  character?: string
  order?: number
}

export interface TmdbEpisodeSummary {
  id?: number
  name?: string
  overview?: string
  vote_average?: number
  vote_count?: number
  air_date?: string
  episode_number?: number
  episode_type?: string
  production_code?: string
  runtime?: number | null
  season_number?: number
  show_id?: number
  still_path?: string | null
}

export interface TmdbEpisodeDetail extends TmdbEpisodeSummary {
  production_code?: string
  still_path?: string | null
  crew?: TmdbPersonCredit[]
  guest_stars?: TmdbPersonCredit[]
}

export interface TmdbSeasonDetail {
  air_date?: string | null
  episode_count?: number
  id?: number
  name?: string
  overview?: string
  poster_path?: string | null
  season_number?: number
  vote_average?: number
  episodes?: TmdbEpisodeDetail[]
}

export interface TmdbNetwork {
  id?: number
  logo_path?: string | null
  name?: string
  origin_country?: string
}

export interface TmdbCompany {
  id?: number
  logo_path?: string | null
  name?: string
  origin_country?: string
}

export interface TmdbImage {
  aspect_ratio?: number
  height?: number
  iso_3166_1?: string | null
  iso_639_1?: string | null
  file_path?: string
  vote_average?: number
  vote_count?: number
  width?: number
}

export interface TmdbVideo {
  iso_639_1?: string
  iso_3166_1?: string
  name?: string
  key?: string
  site?: string
  size?: number
  type?: string
  official?: boolean
  published_at?: string
  id?: string
}

export interface TmdbContentRatingResult {
  iso_3166_1?: string
  rating?: string
  descriptors?: string[]
}

export interface TmdbContentRatings {
  results?: TmdbContentRatingResult[]
}

export interface TmdbWatchProviderItem {
  logo_path?: string
  provider_id?: number
  provider_name?: string
  display_priority?: number
}

export interface TmdbWatchProviderCountry {
  link?: string
  free?: TmdbWatchProviderItem[]
  flatrate?: TmdbWatchProviderItem[]
  buy?: TmdbWatchProviderItem[]
  rent?: TmdbWatchProviderItem[]
}

export interface TmdbWatchProviders {
  results?: Record<string, TmdbWatchProviderCountry>
}

export interface TmdbImages {
  backdrops?: TmdbImage[]
  logos?: TmdbImage[]
  posters?: TmdbImage[]
}

export interface TmdbSeriesInfo {
  adult?: boolean
  backdrop_path?: string | null
  created_by?: TmdbPersonCredit[]
  episode_run_time?: number[]
  first_air_date?: string | null
  genres?: { id: number; name: string }[]
  homepage?: string | null
  id?: number
  in_production?: boolean
  languages?: string[]
  last_air_date?: string | null
  last_episode_to_air?: TmdbEpisodeSummary | null
  name?: string
  next_episode_to_air?: TmdbEpisodeSummary | null
  networks?: TmdbNetwork[]
  number_of_episodes?: number
  number_of_seasons?: number
  origin_country?: string[]
  original_language?: string
  original_name?: string
  overview?: string | null
  popularity?: number
  poster_path?: string | null
  production_companies?: TmdbCompany[]
  production_countries?: { iso_3166_1?: string; name?: string }[]
  seasons?: TmdbSeasonDetail[]
  spoken_languages?: {
    english_name?: string
    iso_639_1?: string
    name?: string
  }[]
  status?: string
  tagline?: string | null
  type?: string
  vote_average?: number
  vote_count?: number
  content_ratings?: TmdbContentRatings
  "watch/providers"?: TmdbWatchProviders
  videos?: { results?: TmdbVideo[] }
  images?: TmdbImages
  certification_rating?: string | null
  trailers?: TmdbVideo[]
  media_type?: string
}
