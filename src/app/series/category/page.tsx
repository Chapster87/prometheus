import { ReactQueryProvider } from "@/client/query/Provider"
import { prefetchSeriesBatch } from "@/server/query/prefetch"
import SeriesClient from "./series.client"
import { getSeriesRaw } from "@/server/series" // for fallback when prefetch fails or oversized
import type { DehydratedState } from "@tanstack/react-query"
import s from "./styles.module.css"

const CATEGORIES = ["10080"]
// const CATEGORIES = ["X"]

const dehydrated: DehydratedState | null = await (async () => {
  try {
    // Prefetch only if payload expected to be reasonably small (<2MB)
    // For oversized categories skip hydration to avoid unstable_cache limit errors.
    const prefetchCandidate = await getSeriesRaw(CATEGORIES[0])
    const sizeEstimate = Buffer.from(JSON.stringify(prefetchCandidate)).length
    if (sizeEstimate < 1.8 * 1024 * 1024) {
      console.log("Prefetch size is within limit, proceeding with hydration")
      return await prefetchSeriesBatch(CATEGORIES)
    } else {
      console.warn(
        `Prefetch size estimate for categories [${CATEGORIES.join(
          ","
        )}] exceeds limit, skipping hydration`
      )
      // Skip hydration; client will fetch after mount.
      return null
    }
  } catch {
    console.error("Prefetch failed, falling back to client fetch")
    return null
  }
})()

export default async function Series() {
  return (
    <div className={s.page}>
      <main className={s.main}>
        <ReactQueryProvider initialState={dehydrated}>
          <SeriesClient categories={CATEGORIES} />
        </ReactQueryProvider>
      </main>
    </div>
  )
}
