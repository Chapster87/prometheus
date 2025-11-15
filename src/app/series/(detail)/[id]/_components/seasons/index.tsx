import { useState } from "react"
import * as Tabs from "@radix-ui/react-tabs"
import * as Dialog from "@radix-ui/react-dialog"
import Image from "next/image"
import Heading from "@/components/typography/heading"
import Text from "@/components/typography/text"
import Button from "@/components/button"
import { X, Play, Clipboard, Check } from "lucide-react"
import {
  Season,
  Episode,
  Episodes,
  TmdbSeasonDetail,
  TmdbEpisodeSummary,
} from "@/types/series"

import { minutesToHrs, isFutureDate } from "@/utils/utils"

import commonStyles from "@/styles/common.module.css"
import tabStyles from "@/styles/components/tabs.module.css"
import dialogStyles from "@/styles/components/dialog.module.css"
import s from "./styles.module.css"

interface SeriesSeasonsProps {
  seasons: Season[]
  episodes: Episodes
  tmdbSeasons?: TmdbSeasonDetail[]
}

export default function SeriesSeasons({
  seasons,
  episodes,
  tmdbSeasons = [],
}: SeriesSeasonsProps) {
  return (
    <div className={`${commonStyles.siteContainer} ${s.seasonsMain}`}>
      <Tabs.Root defaultValue="tab1" className={tabStyles.tabsRoot}>
        <Tabs.List aria-label="Season Tabs" className={tabStyles.tabsList}>
          {seasons.map((season) => {
            if (season.air_date && isFutureDate(new Date(season.air_date))) {
              return null
            }
            const { name, season_number } = season
            return (
              <Tabs.Trigger
                key={`trigger${season_number}`}
                value={`tab${season_number}`}
                className={tabStyles.tabTrigger}
              >
                {name}
              </Tabs.Trigger>
            )
          })}
        </Tabs.List>
        {seasons.map((season) => {
          if (season.air_date && isFutureDate(new Date(season.air_date))) {
            return null
          }
          const { season_number } = season
          const seasonEpisodes = Array.isArray(episodes?.[season_number])
            ? episodes[season_number]
            : []

          // Find matching TMDB season
          const tmdbSeason = tmdbSeasons.find(
            (s) => s.season_number === season_number
          )
          // Prepare TMDB episode data array for easy access
          const tmdbEpisodesArr = Array.isArray(tmdbSeason?.episodes)
            ? tmdbSeason.episodes
            : []

          return (
            <Tabs.Content
              key={`content${season_number}`}
              value={`tab${season_number}`}
              className={tabStyles.tabContent}
            >
              <div className={s.episodeList}>
                {seasonEpisodes.map(
                  (episode: Episode, episodeIndex: number) => {
                    const tmdbEpisode = tmdbEpisodesArr[episodeIndex]
                    return (
                      <EpisodeCard
                        key={episodeIndex}
                        episode={episode}
                        tmdbEpisode={tmdbEpisode}
                      />
                    )
                  }
                )}
              </div>
            </Tabs.Content>
          )
        })}
      </Tabs.Root>
    </div>
  )
}

function EpisodeCard({
  episode,
  tmdbEpisode,
}: {
  episode: Episode
  tmdbEpisode?: TmdbEpisodeSummary
}) {
  const { episode_number, name, runtime, vote_average, still_path } =
    tmdbEpisode || {}
  const displayName = name || episode.title
  const [isOpen, setIsOpen] = useState(false)
  const episodeURL = `${process.env.NEXT_PUBLIC_XC_URL}/series/${process.env.NEXT_PUBLIC_XC_USERNAME}/${process.env.NEXT_PUBLIC_XC_PASSWORD}/${episode.id}.${episode.container_extension}`
  return (
    <div className={s.episodeCard}>
      <EpisodeVideoDialog
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        episodeURL={episodeURL}
      >
        <figure className={s.episodeStillWrapper}>
          <Image
            className={s.episodeStill}
            src={`https://image.tmdb.org/t/p/original${still_path}`}
            alt={`Episode: ${name}`}
            width={1920}
            height={1080}
            sizes="(max-width: 600px) 100vw, 230px"
            onClick={() => setIsOpen(true)}
            style={{ cursor: "pointer" }}
          />
          <span className={s.playIconOverlay}>
            <Play size={48} />
          </span>
        </figure>
      </EpisodeVideoDialog>

      <div className={s.cardBody}>
        <Heading level="h3">Episode {episode_number}</Heading>
        <Heading level="h2">{displayName}</Heading>
        {tmdbEpisode?.overview && <Text>{tmdbEpisode.overview}</Text>}
        {tmdbEpisode?.air_date && <Text>Air Date: {tmdbEpisode.air_date}</Text>}
      </div>
      <div className={s.cardFooter}>
        {runtime && <Text className="grow-0">{minutesToHrs(runtime)}</Text>}
        {vote_average && (
          <Text className="rating-average grow-0">
            Rating: {(Math.round(vote_average * 10) / 10).toFixed(1)}
          </Text>
        )}
      </div>
    </div>
  )
}

function EpisodeVideoDialog({
  isOpen,
  setIsOpen,
  episodeURL,
  children,
}: {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  episodeURL: string
  children: React.ReactNode
}) {
  const [copied, setCopied] = useState(false)
  const [fade, setFade] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(episodeURL)
    setCopied(true)
    setFade(false)
    setTimeout(() => setFade(true), 900)
    setTimeout(() => {
      setCopied(false)
      setFade(false)
    }, 1200)
  }
  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className={dialogStyles.overlay} />
        <Dialog.Content className={dialogStyles.content}>
          <Dialog.Title className={dialogStyles.title}>
            Episode Rating Matrix
          </Dialog.Title>
          <Dialog.Close asChild>
            <Button aria-label="Close Dialog" className={dialogStyles.close}>
              <X />
            </Button>
          </Dialog.Close>
          <div className={dialogStyles.body}>
            <video
              className={s.videoPlayer}
              controls
              width="100%"
              src={episodeURL}
              poster=""
            >
              Sorry, your browser doesn&apos;t support embedded videos.
            </video>
            <div className={s.copyField}>
              <input
                type="text"
                value={episodeURL}
                readOnly
                onClick={handleCopy}
                className={s.copyInput}
              />
              <span className={s.copyIcon}>
                <Check
                  color="#22c55e"
                  className={s.fadeIcon}
                  style={{ opacity: copied ? (fade ? 0 : 1) : 0 }}
                />
                <Clipboard
                  className={s.fadeIcon}
                  style={{ opacity: copied ? (fade ? 1 : 0) : 1 }}
                />
              </span>
            </div>
            <div className={dialogStyles.footer}>
              <Dialog.Close asChild>
                <Button
                  aria-label="Close Dialog"
                  className={dialogStyles.closeBottom}
                >
                  Close
                </Button>
              </Dialog.Close>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
