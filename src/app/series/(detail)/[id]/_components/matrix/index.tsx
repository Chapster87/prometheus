import { isFutureDate, percentageToHsl } from "@/utils/utils"
import { TmdbSeasonDetail } from "@/types/series"
import s from "./styles.module.css"

export default function EpisodeRatingMatrix({
  seasons,
}: {
  seasons: TmdbSeasonDetail[]
}) {
  // console.log('seasons', seasons);

  return (
    <div className={s.matrix}>
      <div className={`${s.matrixInner}`}>
        {seasons.map((season, seasonIndex) => {
          if (
            !season.episodes ||
            !season.episodes.length ||
            season.season_number === 0
          ) {
            return null
          }

          const { episodes, name, season_number } = season

          return (
            <div className={s.season} key={seasonIndex}>
              {/* {name} */}
              <div className={s.episodes}>
                {episodes.map((episode, episodeIndex) => {
                  const {
                    air_date,
                    name,
                    episode_number,
                    overview,
                    vote_average,
                    season_number,
                  } = episode
                  if (air_date && isFutureDate(new Date(air_date))) {
                    return null
                  }
                  return (
                    <div
                      key={`${seasonIndex}-${episodeIndex}`}
                      className={s.episodeTile}
                      data-tip={`${name} - ${overview}`}
                      style={{
                        backgroundColor: percentageToHsl(
                          (vote_average || 0) * 0.1
                        ),
                      }}
                    >
                      <span className={s.seasonEpisodeLabel}>
                        S{season_number} E{episode_number}
                      </span>
                      <span className={s.rating}>
                        {(Math.round((vote_average || 0) * 10) / 10).toFixed(1)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
