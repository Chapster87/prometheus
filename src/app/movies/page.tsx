import { ReactQueryProvider } from "@/client/query/Provider"
import { prefetchMovieCategories } from "@/server/query/prefetch"
import MoviesClient from "./movies.client"
import { getMoviesCategoriesRaw } from "@/server/movies" // fallback when prefetch skipped
import type { DehydratedState } from "@tanstack/react-query"

const dehydrated: DehydratedState | null = await (async () => {
  try {
    // Prefetch only if payload expected to be reasonably small (<2MB)
    // For oversized categories skip hydration to avoid unstable_cache limit errors.
    const prefetchCandidate = await getMoviesCategoriesRaw()
    const sizeEstimate = Buffer.from(JSON.stringify(prefetchCandidate)).length
    if (sizeEstimate < 1.8 * 1024 * 1024) {
      console.log("Movie prefetch size within limit, proceeding with hydration")
      return await prefetchMovieCategories()
    } else {
      console.warn(
        `Prefetch size estimate for movie categories exceeds limit, skipping hydration`
      )
      return null
    }
  } catch (e) {
    console.error(
      "Movie categories prefetch failed, falling back to client fetch",
      e
    )
    return null
  }
})()

export default async function Movies() {
  return (
    <div className="page">
      <main className="main">
        <ReactQueryProvider initialState={dehydrated}>
          <MoviesClient />
        </ReactQueryProvider>
      </main>
    </div>
  )
}
