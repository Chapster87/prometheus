import { ReactNode } from "react"

export default class Spark {
  config!: config
  /**
   * @param {{ xcUrl: string, auth: { username: string, password: string } }} [config]
   */
  constructor(session: session = {}) {
    if (import.meta.env.VITE_REACT_APP_USE_ENV === "true") {
      this.config = {
        tmdbApiKey: import.meta.env.VITE_REACT_APP_TMDB_API_KEY,
        tmdbApiReadAccessToken: import.meta.env
          .VITE_REACT_APP_TMDB_API_READ_ACCESS_TOKEN,
        xcUrl: import.meta.env.VITE_REACT_APP_XC_URL,
        xcAuth: {
          username: import.meta.env.VITE_REACT_APP_XC_USERNAME || "",
          password: import.meta.env.VITE_REACT_APP_XC_PASSWORD || "",
        },
      }
    } else if (session && session.user) {
      this.config = {
        tmdbApiKey: session.user.user_metadata.tmdbApiKey,
        tmdbApiReadAccessToken:
          session.user.user_metadata.tmdbApiReadAccessToken,
        xcUrl: session.user.user_metadata.xcUrl,
        xcAuth: {
          username: session.user.user_metadata.xcUsername,
          password: session.user.user_metadata.xcPassword,
        },
      }
    }
  }

  /**
   * query tmdb api
   *
   * @param {string} [section]
   * @param {string} [content]
   * @param {Object} [params]
   * @returns {Promise<any>}
   */
  async getTmdb(
    section: string,
    content: string,
    path_params: TmdbParams | null,
    query_params: TmdbParams | null
  ): Promise<TmdbResponse | undefined> {
    if (this.config && this.config.tmdbApiReadAccessToken) {
      const tmdbBaseUrl = "https://api.themoviedb.org/3"
      const options: RequestInit = {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${this.config.tmdbApiReadAccessToken}`,
        },
      }

      let fetchUrl = `${tmdbBaseUrl}/${section}/${content}`

      if (path_params) {
        const pathstring = Object.entries(path_params)
          .map(([key, value]) => `${key}/${value}`)
          .join("/")
        fetchUrl += `/${pathstring}`
      }

      if (query_params) {
        const querystring = new URLSearchParams(query_params as any).toString()
        fetchUrl = fetchUrl + `?${querystring}`
      }

      // console.log('fetchUrl:', fetchUrl);

      const res = await fetch(fetchUrl, options)
      if (!res.ok) {
        const message = `An error has occurred: ${res.status}`
        console.error(message, "FetchURL: " + fetchUrl)
        return
      }

      const data: TmdbResponse = await res.json()

      return data
    }
  }

  /**
   * Fetch Movie Details from TMDB
   *
   */
  async getTmdbMovie(id: number): Promise<TmdbResponse | undefined> {
    const query_params: TmdbParams = {
      append_to_response: "release_dates,watch/providers",
      language: "en-US",
    }

    let movieDetails = await this.getTmdb(
      "movie",
      id.toString(),
      null,
      query_params
    )
    if (movieDetails) {
      movieDetails.media_type = "movie"
      movieDetails = await this.getTmdbCertificationRating(
        movieDetails as TmdbResponse & { media_type: string }
      )
    }

    return movieDetails
  }

  /**
   * Fetch Movie Details for an array of ids from TMDB
   *
   */
  async getTmdbMoviesGroup(
    movieIdArray: number[]
  ): Promise<TmdbResponse[] | undefined> {
    const query_params: TmdbParams = {
      append_to_response: "release_dates,watch/providers",
      language: "en-US",
    }

    const movieDetails: TmdbResponse[] = []

    for (let i in movieIdArray) {
      let movie = await this.getTmdb(
        "movie",
        movieIdArray[i].toString(),
        null,
        query_params
      )

      if (movie) {
        movie = { ...movie, media_type: "movie" }
        if (movie.media_type) {
          movie = await this.getTmdbCertificationRating(
            movie as TmdbResponse & { media_type: string }
          )
        }
        movieDetails.push(movie)
      }
    }

    if (movieDetails.length > 0) {
      return movieDetails
    }
  }

  /**
   * Fetch Movie Genres from TMDB
   *
   */
  async getTmdbMovieGenres() {
    const query_params = {
      language: "en-US",
    }

    const movieGenres = await this.getTmdb(
      "genre",
      "movie/list",
      null,
      query_params
    )

    return movieGenres ? movieGenres.genres : undefined
  }

  /**
   * Fetch Movies from specific genre(s) id
   *
   */
  async getTmdbMoviesByGenres(
    ids: string,
    page: number
  ): Promise<TmdbResponse | undefined> {
    const query_params: TmdbParams = {
      include_adult: false,
      include_video: false,
      language: "en-US",
      page: page,
      sort_by: "popularity.desc",
      with_genres: ids,
      with_original_language: "en",
    }

    const moviesByGenres = await this.getTmdb(
      "discover",
      "movie",
      null,
      query_params
    )

    return moviesByGenres
  }

  /**
   * Fetch Movie Details for an array of ids from TMDB
   *
   */
  async getTmdbShowGroup(
    showIdArray: number[]
  ): Promise<TmdbResponse[] | undefined> {
    const query_params: TmdbParams = {
      append_to_response: "content_ratings,watch/providers",
      language: "en-US",
    }

    const showDetails: TmdbResponse[] = []

    for (let i in showIdArray) {
      let show = await this.getTmdb(
        "tv",
        showIdArray[i].toString(),
        null,
        query_params
      )

      if (show) {
        show.media_type = "tv"
        show = await this.getTmdbCertificationRating(
          show as TmdbResponse & { media_type: string }
        )
        showDetails.push(show)
      }
    }

    if (showDetails.length > 0) {
      return showDetails
    }
  }

  /**
   * Fetch TV Show Season Details from TMDB
   *
   */
  async getTmdbShowSeasonDetails(id: number, season: number) {
    const path_params: TmdbParams = {
      season: season.toString(),
    }
    const query_params: TmdbParams = {
      language: "en-US",
    }

    let showDetails = await this.getTmdb(
      "tv",
      id.toString(),
      path_params,
      query_params
    )

    return showDetails
  }

  /**
   * Fetch TV Show Trailer from TMDB
   *
   */
  async getTmdbShowTrailers(id: number) {
    const query_params: TmdbParams = {
      language: "en-US",
    }

    let showDetails = await this.getTmdb(
      "tv",
      `${id.toString()}/videos`,
      null,
      query_params
    )

    return showDetails
  }

  /**
   * Fetch TV Show Details from TMDB
   *
   */
  async getTmdbShow(id: number): Promise<TmdbResponse | undefined> {
    const query_params: TmdbParams = {
      append_to_response: "content_ratings,watch/providers",
      language: "en-US",
    }

    let showDetails = await this.getTmdb(
      "tv",
      id.toString(),
      null,
      query_params
    )
    if (showDetails) {
      showDetails.media_type = "show"

      // Add Certification Rating
      showDetails = await this.getTmdbCertificationRating(
        showDetails as TmdbResponse & { media_type: string }
      )

      // Add trailer
      const videos = await this.getTmdbShowTrailers(id)
      if (videos && videos.results && videos.results.length) {
        showDetails.trailers = []
        videos.results.map((vid) => {
          if (vid.type === "Trailer" && vid.site === "YouTube") {
            if (showDetails && showDetails.trailers) {
              showDetails.trailers.push(vid)
            }
          }
        })
      }

      // Add episode data to seasons
      if (showDetails.seasons && showDetails.seasons.length) {
        showDetails.seasons = await Promise.all(
          showDetails.seasons.map(async (season: { season_number: number }) => {
            const seasonDetails = await this.getTmdbShowSeasonDetails(
              id,
              season.season_number
            )
            return { ...season, episodes: seasonDetails?.episodes }
          })
        )
      }
    }

    return showDetails
  }

  /**
   * Fetch Show Genres from TMDB
   *
   */
  async getTmdbShowGenres() {
    const query_params = {
      language: "en-US",
    }

    const showGenres = await this.getTmdb(
      "genre",
      "tv/list",
      null,
      query_params
    )

    return showGenres ? showGenres.genres : undefined
  }

  /**
   * Fetch Show from specific genre(s) id
   *
   */
  async getTmdbShowByGenres(
    ids: string,
    page: number
  ): Promise<TmdbResponse | undefined> {
    const query_params: TmdbParams = {
      include_adult: false,
      include_video: false,
      language: "en-US",
      page: page,
      sort_by: "popularity.desc",
      with_genres: ids,
      with_original_language: "en",
    }

    const showByGenres = await this.getTmdb(
      "discover",
      "tv",
      null,
      query_params
    )

    return showByGenres
  }

  /**
   * Fetch Trending Movie from TMDB and attach stream id to link to Movie Detail
   *
   */
  async getTrendingMovies() {
    if (this.config) {
      const query_params = {
        language: "en-US",
      }

      const trendingMovies = await this.getTmdb(
        "trending",
        "movie/week",
        null,
        query_params
      )

      if (trendingMovies && trendingMovies.results.length > 0) {
        const trendingMoviesIDs: number[] = []
        let updatedTrendingMovies = null

        trendingMovies.results.map((movies) => {
          trendingMoviesIDs.push(movies.id)
        })

        if (trendingMoviesIDs.length) {
          updatedTrendingMovies = await this.getTmdbMoviesGroup(
            trendingMoviesIDs
          )
        }

        return updatedTrendingMovies
      }
    }
  }

  /**
   * Fetch Trending Show from TMDB and attach stream id to link to Show Detail
   *
   */
  async getTrendingShow() {
    const query_params = {
      language: "en-US",
    }

    const trendingShow = await this.getTmdb(
      "trending",
      "tv/week",
      null,
      query_params
    )

    if (trendingShow && trendingShow.results) {
      const trendingShowIDs: number[] = []
      let updatedTrendingShow = null

      trendingShow.results.map((show) => {
        trendingShowIDs.push(show.id)
      })

      if (trendingShowIDs.length) {
        updatedTrendingShow = await this.getTmdbShowGroup(trendingShowIDs)
      }

      return updatedTrendingShow
    }
  }

  /**
   * GET Media Certification Rating
   *
   * @param {Object} showList
   */
  async getTmdbCertificationRating(
    media: TmdbResponse & { media_type: string }
  ): Promise<TmdbResponse & { certification_rating: string | null }> {
    let updatedMedia = { ...media, certification_rating: null as string | null }

    if (media.media_type === "movie") {
      let ratingMatch = media.release_dates?.results.filter(
        (rating: {
          iso_3166_1: string
          release_dates: { certification: string }[]
        }) => rating.iso_3166_1 === "US"
      )
      if (
        ratingMatch &&
        ratingMatch.length &&
        ratingMatch[0].release_dates.length &&
        ratingMatch[0].release_dates[0].certification
      ) {
        updatedMedia.certification_rating =
          ratingMatch[0].release_dates[0].certification
      }
    } else {
      let ratingMatch = media.content_ratings?.results.filter(
        (rating: { iso_3166_1: string; rating: string | null }) =>
          rating.iso_3166_1 === "US"
      )
      if (ratingMatch && ratingMatch.length && ratingMatch[0].rating) {
        updatedMedia.certification_rating = ratingMatch[0].rating
      }
    }

    return updatedMedia
  }
}

type config = {
  tmdbApiKey?: string
  tmdbApiReadAccessToken?: string
  xcUrl?: string
  xcAuth?: {
    username: string
    password: string
  }
}

type session = {
  user?: {
    user_metadata: {
      tmdbApiKey: string
      tmdbApiReadAccessToken: string
      xcUrl: string
      xcUsername: string
      xcPassword: string
    }
  }
}

type TmdbParams = {
  append_to_response?: string
  language?: string
  include_adult?: boolean
  include_video?: boolean
  page?: number
  sort_by?: string
  with_genres?: string
  query?: string
  first_air_date_year?: number
  season?: string
  with_original_language?: string
}

type TmdbResponse = {
  title: ReactNode
  results: any[]
  genres?: any[]
  content_ratings?: {
    results: {
      iso_3166_1: string
      rating: string | null
    }[]
  }
  release_dates?: {
    results: {
      iso_3166_1: string
      release_dates: {
        certification: string
      }[]
    }[]
  }
  media_type?: string
  seasons?: { season_number: number; episodes?: any[] }[]
  episodes?: any[]
  trailers?: any[]
}
